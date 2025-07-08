import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from './entities/message.entity';
import { UsersModule } from 'src/users/users.module';
import { MessagesUtils } from './messages.utils';
import { OnlyLowercaseRegex } from 'src/app/common/regex/only-lowercase.regex';
import { ONLY_LOWERCASE_REGEX, REMOVE_SPACES_REGEX } from './messages.constant';
import { RemoveSpacesRegex } from 'src/app/common/regex/remove-spaces.regex';

@Module({
  imports: [TypeOrmModule.forFeature([MessageEntity]), UsersModule],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    {
      provide: MessagesUtils,
      useClass: MessagesUtils,
      // useValue: new MessagesUtilsMock(), // mock for test, need import: MessagesUtilsMock
    },
    {
      provide: ONLY_LOWERCASE_REGEX,
      useClass: OnlyLowercaseRegex,
    },
    {
      provide: REMOVE_SPACES_REGEX,
      useClass: RemoveSpacesRegex,
    },
  ],
})
export class MessagesModule {}
