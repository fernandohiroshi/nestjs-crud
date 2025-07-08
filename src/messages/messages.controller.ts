import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PaginationDto } from 'src/app/common/dto/pagination.dto';
import { MessagesUtils } from './messages.utils';
import { RegexProtocol } from 'src/app/common/regex/protocol.regex';
import { ONLY_LOWERCASE_REGEX, REMOVE_SPACES_REGEX } from './messages.constant';

@Controller('messages')
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly messagesUtils: MessagesUtils,
    @Inject(REMOVE_SPACES_REGEX)
    private readonly removeSpacesRegex: RegexProtocol,
    @Inject(ONLY_LOWERCASE_REGEX)
    private readonly onlyLowercaseRegex: RegexProtocol,
  ) {}

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const messages = await this.messagesService.findAll(paginationDto);
    return messages;
  }

  @Get(':id')
  findById(@Param('id') id: number) {
    console.log(this.removeSpacesRegex.execute('Hello World !!!'));
    console.log(this.onlyLowercaseRegex.execute('Hello World !!!'));
    return this.messagesService.findById(id);
  }

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.update(id, updateMessageDto);
  }

  @Delete(':id')
  deleteById(@Param('id') id: number) {
    return this.messagesService.deleteById(id);
  }
}
