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
import { APP_FILTER } from '@nestjs/core';
import { MyExceptionFilter } from './common/filters/my-exception.filter';

@Module({
  imports: [MessagesModule, UsersModule],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: MyExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SimpleMiddleware).forRoutes({
      path: 'messages',
      method: RequestMethod.ALL,
    });
  }
}
