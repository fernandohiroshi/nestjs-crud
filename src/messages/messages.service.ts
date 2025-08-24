import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MessageEntity } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { PaginationDto } from 'src/app/common/dto/pagination.dto';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    private readonly userService: UsersService,
  ) {}

  throwNotFoundError() {
    throw new NotFoundException('Message not found!');
  }

  async findAll(paginationDto?: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto ?? {};

    const messages = await this.messageRepository.find({
      take: limit,
      skip: offset,
      relations: ['from', 'to'],
      order: {
        id: 'desc',
      },
      select: {
        from: {
          id: true,
          name: true,
        },
        to: {
          id: true,
          name: true,
        },
      },
    });
    return messages;
  }

  async findById(id: number) {
    const message = await this.messageRepository.findOne({
      where: {
        id,
      },
      relations: ['from', 'to'],
      select: {
        from: {
          id: true,
          name: true,
        },
        to: {
          id: true,
          name: true,
        },
      },
    });

    if (message) return message;

    throw new NotFoundException('Message not found');
  }

  async create(
    createMessageDto: CreateMessageDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const { toId } = createMessageDto;

    const to = await this.userService.findOne(toId);
    const from = await this.userService.findOne(tokenPayload.sub);

    const newMessage = {
      text: createMessageDto.text,
      from,
      to,
      read: false,
      date: new Date(),
    };

    const message = this.messageRepository.create(newMessage);
    await this.messageRepository.save(message);
    return {
      ...message,
      from: {
        id: message.from.id,
        name: message.from.name,
      },
      to: {
        id: message.to.id,
        name: message.to.name,
      },
    };
  }

  async update(
    id: number,
    updateMessageDto: UpdateMessageDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const message = await this.findById(id);

    if (message.from.id !== tokenPayload.sub) {
      throw new ForbiddenException(
        'You are not allowed to update this message',
      );
    }

    message.text = updateMessageDto?.text ?? message.text;
    message.read = updateMessageDto?.read ?? message.read;

    await this.messageRepository.save(message);

    return message;
  }

  async deleteById(id: number, tokenPayload: TokenPayloadDto) {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['from'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.from.id !== tokenPayload.sub) {
      throw new ForbiddenException(
        'You are not allowed to update this message',
      );
    }

    return this.messageRepository.remove(message);
  }
}
