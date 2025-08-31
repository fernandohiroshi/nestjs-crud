import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { GlobalConfigModule } from 'src/global-config/global-config.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import globalConfig from 'src/global-config/global-config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MessagesModule } from 'src/messages/messages.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import * as path from 'path';
import appConfig from 'src/app/config/app.config';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

const login = async (
  app: INestApplication,
  email: string,
  password: string,
) => {
  const response = await request(app.getHttpServer())
    .post('/auth')
    .send({ email, password });

  return response.body.accessToken;
};

const createUserAndLogin = async (app: INestApplication) => {
  const email = 'testuser@example.com';
  const password = 'testPassword123';
  const name = 'Test User';

  await request(app.getHttpServer()).post('/users').send({
    email,
    password,
    name,
  });

  return login(app, email, password);
};

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        GlobalConfigModule,
        ConfigModule.forFeature(globalConfig),
        TypeOrmModule.forRoot({
          type: process.env.DATABASE_TYPE_TEST as any,
          host: process.env.DATABASE_HOST_TEST,
          port: Number(process.env.DATABASE_PORT_TEST),
          username: process.env.DATABASE_USERNAME_TEST,
          password: process.env.DATABASE_PASSWORD_TEST,
          database: process.env.DATABASE_NAME_TEST,
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true, // Limpa o schema a cada teste
        }),

        ServeStaticModule.forRoot({
          rootPath: path.resolve(__dirname, '..', '..', 'pictures'),
          serveRoot: '/pictures',
        }),
        MessagesModule,
        UsersModule,
        AuthModule,
      ],
    }).compile();

    app = module.createNestApplication();

    // Configuração global de pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: false,
      }),
    );

    // Apply application configurations
    appConfig(app);

    await app.init();

    // Create a user and login for authenticated tests
    authToken = await createUserAndLogin(app);
  });

  afterEach(async () => {
    await app.close();
  });

  ////////////////////////////////////////////////////////////////////////////////
  //                              HERO CREATE USERS                             //
  ////////////////////////////////////////////////////////////////////////////////
  describe('POST /users', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'john.doe@example.com',
        password: 'securePassword123',
        name: 'John Doe',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
        id: expect.any(Number),
        email: createUserDto.email,
        passwordHash: expect.any(String),
        name: createUserDto.name,
        active: true,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        picture: '',
      });
    });

    it('should return error if email already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'jane.doe@example.com',
        password: 'anotherPassword123',
        name: 'Jane Doe',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(HttpStatus.CONFLICT);

      expect(response.body.message).toBe('E-mail already exists');
    });

    it('should return error for short password', async () => {
      const createUserDto: CreateUserDto = {
        email: 'short.pass@example.com',
        password: '123',
        name: 'Short Pass',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual([
        'password must be longer than or equal to 5 characters',
      ]);
    });

    it('should return error for missing required fields', async () => {
      const createUserDto = {
        email: '',
        password: 'validPassword',
        name: '',
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual(
        expect.arrayContaining([
          'email must be an email',
          'name should not be empty',
          'name must be longer than or equal to 3 characters',
        ]),
      );
    });
  });

  ////////////////////////////////////////////////////////////////////////////////
  //                               HERO GET USERS                               //
  ////////////////////////////////////////////////////////////////////////////////
  describe('GET /users', () => {
    it('should return all users when authenticated', async () => {
      await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User',
        })
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            email: expect.any(String),
            name: expect.any(String),
          }),
        ]),
      );
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.message).toBeDefined();
    });
  });

  ////////////////////////////////////////////////////////////////////////////////
  //                          HERO GET USER BY ID                               //
  ////////////////////////////////////////////////////////////////////////////////
  describe('GET /users/:id', () => {
    it('should return a user by ID', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'getuser@example.com',
          password: 'password123',
          name: 'Get User',
        })
        .expect(HttpStatus.CREATED);

      const userId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: userId,
          email: 'getuser@example.com',
          name: 'Get User',
        }),
      );
    });

    it('should return error for user not found', async () => {
      await request(app.getHttpServer())
        .get('/users/9999') // Fake ID
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.CONFLICT);
    });
  });

  ////////////////////////////////////////////////////////////////////////////////
  //                             HERO UPDATE USER                               //
  ////////////////////////////////////////////////////////////////////////////////
  describe('PATCH /users/:id', () => {
    it('should update a user', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'updateuser@example.com',
          password: 'password123',
          name: 'Update User',
        })
        .expect(HttpStatus.CREATED);

      const userId = createResponse.body.id;
      const userAuthToken = await login(
        app,
        'updateuser@example.com',
        'password123',
      );

      const updateResponse = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({
          name: 'Updated User Name',
        })
        .set('Authorization', `Bearer ${userAuthToken}`)
        .expect(HttpStatus.OK);

      expect(updateResponse.body).toEqual(
        expect.objectContaining({
          id: userId,
          name: 'Updated User Name',
        }),
      );
    });

    it('should return error for user not found', async () => {
      await request(app.getHttpServer())
        .patch('/users/9999') // Fake ID
        .send({
          name: 'Updated Name',
        })
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.CONFLICT);
    });
  });

  ////////////////////////////////////////////////////////////////////////////////
  //                             HERO DELETE USER                               //
  ////////////////////////////////////////////////////////////////////////////////
  describe('DELETE /users/:id', () => {
    it('should delete a user', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'deleteuser@example.com',
          password: 'password123',
          name: 'Delete User',
        })
        .expect(HttpStatus.CREATED);

      const userId = createResponse.body.id;
      const userAuthToken = await login(
        app,
        'deleteuser@example.com',
        'password123',
      );

      const response = await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${userAuthToken}`)
        .expect(HttpStatus.OK);

      expect(response.body.email).toBe('deleteuser@example.com');
    });

    it('should return error for user not found', async () => {
      await request(app.getHttpServer())
        .delete('/users/9999') // Fake ID
        .set('Authorization', `Bearer ${authToken}`)
        .expect(HttpStatus.CONFLICT);
    });
  });
});
