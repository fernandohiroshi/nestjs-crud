import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageEntity } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity>,
  ) {}

  async findAll() {
    const messages = await this.messageRepository.find();
    return messages;
  }

  async findById(id: number) {
    const message = await this.messageRepository.findOne({
      where: {
        id,
      },
    });

    if (message) return message;

    throw new NotFoundException('Message not found');
  }

  async create(createMessageDto: CreateMessageDto) {
    const newMessage = {
      ...createMessageDto,
      read: false,
      date: new Date(),
    };

    const message = this.messageRepository.create(newMessage);

    return this.messageRepository.save(message);
  }

  async update(id: number, updateMessageDto: UpdateMessageDto) {
    const partialUpdateMessageDto = {
      read: updateMessageDto?.read,
      text: updateMessageDto?.text,
    };

    const message = await this.messageRepository.preload({
      id,
      ...partialUpdateMessageDto,
    });

    if (!message) {
      throw new NotFoundException('Update Error');
    }

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
