import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './entities/message.entity';
import { UsersModule } from 'src/users/users.module';
import { ConfigModule } from '@nestjs/config';
import messagesConfig from './messages.config';

@Module({
  imports: [
    ConfigModule.forFeature(messagesConfig),
    TypeOrmModule.forFeature([MessageEntity]),
    UsersModule,
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
