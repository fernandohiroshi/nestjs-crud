import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './entities/message.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity]), UsersModule],
  controllers: [MessagesController],
  providers: [MessagesService], // Is possible use useFactory in providers
})
export class MessagesModule {}
