import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PaginationDto } from 'src/app/common/dto/pagination.dto';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { SetRoutePolicy } from 'src/auth/decoratos/set-route-policy-decorator';
import { RoutePolicies } from 'src/auth/enum/route-policies.enum';
import { AuthAndPolicyGuard } from 'src/auth/guards/auth-and-policy.guard';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const messages = await this.messagesService.findAll(paginationDto);
    return messages;
  }

  @Get(':id')
  findById(@Param('id') id: number) {
    return this.messagesService.findById(id);
  }

  @SetRoutePolicy(RoutePolicies.createMessage)
  @UseGuards(AuthAndPolicyGuard)
  @Post()
  create(
    @Body() createMessageDto: CreateMessageDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.messagesService.create(createMessageDto, tokenPayload);
  }

  @SetRoutePolicy(RoutePolicies.updateMessage)
  @UseGuards(AuthAndPolicyGuard)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateMessageDto: UpdateMessageDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.messagesService.update(id, updateMessageDto, tokenPayload);
  }

  @SetRoutePolicy(RoutePolicies.deleteMessage)
  @UseGuards(AuthAndPolicyGuard)
  @Delete(':id')
  deleteById(
    @Param('id') id: number,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.messagesService.deleteById(id, tokenPayload);
  }
}
