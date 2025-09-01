import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalConfigModule } from 'src/global-config/global-config.module';
import { ConfigModule } from '@nestjs/config';
import globalConfig from 'src/global-config/global-config';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
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
          dropSchema: true,
        }),
        UsersModule,
        AuthModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth - login success', async () => {
    // Cria usuário para login
    await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'auth@e2e.com', password: 'pass123', name: 'Auth E2E' })
      .expect(HttpStatus.CREATED);
    // Login
    const res = await request(app.getHttpServer())
      .post('/auth')
      .send({ email: 'auth@e2e.com', password: 'pass123' })
      .expect(HttpStatus.CREATED);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('POST /auth - login error (wrong password)', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'authfail@e2e.com',
        password: 'pass123',
        name: 'Auth Fail',
      })
      .expect(HttpStatus.CREATED);
    await request(app.getHttpServer())
      .post('/auth')
      .send({ email: 'authfail@e2e.com', password: 'wrong' })
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('POST /auth/refresh - refresh success', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'refresh@e2e.com',
        password: 'pass123',
        name: 'Refresh E2E',
      })
      .expect(HttpStatus.CREATED);
    const loginRes = await request(app.getHttpServer())
      .post('/auth')
      .send({ email: 'refresh@e2e.com', password: 'pass123' })
      .expect(HttpStatus.CREATED);
    const refreshToken = loginRes.body.refreshToken;
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken })
      .expect(HttpStatus.CREATED);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
  });

  it('POST /auth/refresh - refresh error (invalid token)', async () => {
    await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: 'invalidtoken' })
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
