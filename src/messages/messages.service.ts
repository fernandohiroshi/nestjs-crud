import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageEntity } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { PaginationDto } from 'src/app/common/dto/pagination.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
    private readonly userService: UsersService,
  ) {}

  throwNotFoundError() {
    throw new NotFoundException('Recado não encontrado');
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

  async create(createMessageDto: CreateMessageDto) {
    const { fromId, toId } = createMessageDto;

    const from = await this.userService.findOne(fromId);
    const to = await this.userService.findOne(toId);

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
      },
      to: {
        id: message.to.id,
      },
    };
  }

  async update(id: number, updateMessageDto: UpdateMessageDto) {
    const message = await this.findById(id);

    message.text = updateMessageDto?.text ?? message.text;
    message.read = updateMessageDto?.read ?? message.read;

    await this.messageRepository.save(message);

    return message;
  }

  async deleteById(id: number) {
    const message = await this.messageRepository.findOneBy({
      id,
    });

    if (!message) {
      throw new NotFoundException('Error deleting');
    }

    return this.messageRepository.remove(message);
  }
}
