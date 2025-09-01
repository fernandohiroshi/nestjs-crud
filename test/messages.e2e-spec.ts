import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { MessagesModule } from 'src/messages/messages.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GlobalConfigModule } from 'src/global-config/global-config.module';
import { ConfigModule } from '@nestjs/config';
import globalConfig from 'src/global-config/global-config';

describe('MessagesController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: number;
  let otherUserId: number;

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
        MessagesModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    // Cria usuário principal
    const userRes = await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'msg@e2e.com', password: 'pass123', name: 'Msg E2E' });
    userId = userRes.body.id;
    const loginRes = await request(app.getHttpServer())
      .post('/auth')
      .send({ email: 'msg@e2e.com', password: 'pass123' });
    accessToken = loginRes.body.accessToken;
    // Cria outro usuário
    const otherRes = await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'other@e2e.com', password: 'pass123', name: 'Other E2E' });
    otherUserId = otherRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /messages - create message (success)', async () => {
    const res = await request(app.getHttpServer())
      .post('/messages')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ toId: otherUserId, text: 'Hello!' })
      .expect(HttpStatus.CREATED);
    expect(res.body.text).toBe('Hello!');
    expect(res.body.from.id).toBe(userId);
    expect(res.body.to.id).toBe(otherUserId);
  });

  it('GET /messages - list messages', async () => {
    const res = await request(app.getHttpServer())
      .get('/messages')
      .expect(HttpStatus.OK);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /messages/:id - get message by id', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/messages')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ toId: otherUserId, text: 'Unique msg' });
    const msgId = createRes.body.id;
    const res = await request(app.getHttpServer())
      .get(`/messages/${msgId}`)
      .expect(HttpStatus.OK);
    expect(res.body.id).toBe(msgId);
    expect(res.body.text).toBe('Unique msg');
  });

  it('PATCH /messages/:id - update message (only owner)', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/messages')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ toId: otherUserId, text: 'Edit me' });
    const msgId = createRes.body.id;
    const res = await request(app.getHttpServer())
      .patch(`/messages/${msgId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: 'Edited' })
      .expect(HttpStatus.OK);
    expect(res.body.text).toBe('Edited');
  });

  it('PATCH /messages/:id - update forbidden for non-owner', async () => {
    // Login como outro usuário
    const loginRes = await request(app.getHttpServer())
      .post('/auth')
      .send({ email: 'other@e2e.com', password: 'pass123' });
    const otherToken = loginRes.body.accessToken;
    // Cria mensagem como userId
    const createRes = await request(app.getHttpServer())
      .post('/messages')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ toId: otherUserId, text: 'Forbidden' });
    const msgId = createRes.body.id;
    await request(app.getHttpServer())
      .patch(`/messages/${msgId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ text: 'Try edit' })
      .expect(HttpStatus.FORBIDDEN);
  });

  it('DELETE /messages/:id - delete message (only owner)', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/messages')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ toId: otherUserId, text: 'Delete me' });
    const msgId = createRes.body.id;
    await request(app.getHttpServer())
      .delete(`/messages/${msgId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.OK);
  });

  it('DELETE /messages/:id - forbidden for non-owner', async () => {
    // Login como outro usuário
    const loginRes = await request(app.getHttpServer())
      .post('/auth')
      .send({ email: 'other@e2e.com', password: 'pass123' });
    const otherToken = loginRes.body.accessToken;
    // Cria mensagem como userId
    const createRes = await request(app.getHttpServer())
      .post('/messages')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ toId: otherUserId, text: 'Del forbidden' });
    const msgId = createRes.body.id;
    await request(app.getHttpServer())
      .delete(`/messages/${msgId}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(HttpStatus.FORBIDDEN);
  });

  it('POST /messages - unauthorized if not authenticated', async () => {
    await request(app.getHttpServer())
      .post('/messages')
      .send({ toId: otherUserId, text: 'No auth' })
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
