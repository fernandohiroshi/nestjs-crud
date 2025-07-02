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

  private lastId = 1;
  private messages: MessageEntity[] = [
    {
      id: 1,
      text: 'Hello, how are you?',
      from: 'Alice',
      to: 'Bob',
      read: false,
      date: new Date(),
    },
  ];

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

  update(id: string, updateMessageDto: UpdateMessageDto) {
    const currentMessageIndex = this.messages.findIndex(
      (message) => message.id === +id,
    );

    if (currentMessageIndex < 0) {
      throw new NotFoundException('Message not found');
    }

    const currentMessage = this.messages[currentMessageIndex];

    this.messages[currentMessageIndex] = {
      ...currentMessage,
      ...updateMessageDto,
    };

    return this.messages[currentMessageIndex];
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
