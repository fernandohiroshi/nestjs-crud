import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MessagesModule } from '../messages/messages.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module';
import { SimpleMiddleware } from './common/middlewares/simple.middleware';

@Module({
  imports: [MessagesModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SimpleMiddleware).forRoutes({
      path: 'messages',
      method: RequestMethod.ALL,
    });
  }
}
