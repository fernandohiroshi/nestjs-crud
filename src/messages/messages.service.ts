import { Injectable, NotFoundException } from '@nestjs/common';
import { MessageEntity } from './entities/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';

@Injectable()
export class MessagesService {
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

  findAll() {
    return this.messages;
  }

  findById(id: string) {
    const message = this.messages.find((message) => message.id === +id);

    if (message) return message;

    throw new NotFoundException('Message not found');
  }

  create(createMessageDto: CreateMessageDto) {
    this.lastId++;

    const id = this.lastId;
    const newMessage = {
      id,
      ...createMessageDto,
      read: false,
      date: new Date(),
    };

    this.messages.push(newMessage);

    return newMessage;
  }

  update(id: string, updateMessaDto: UpdateMessageDto) {
    const currentMessageIndex = this.messages.findIndex(
      (message) => message.id === +id,
    );

    if (currentMessageIndex < 0) {
      throw new NotFoundException('Message not found');
    }

    const currentMessage = this.messages[currentMessageIndex];

    this.messages[currentMessageIndex] = {
      ...currentMessage,
      ...updateMessaDto,
    };

    return this.messages[currentMessageIndex];
  }

  deleteById(id: string) {
    const currentMessageIndex = this.messages.findIndex(
      (message) => message.id === +id,
    );

    if (currentMessageIndex < 0) {
      throw new NotFoundException('Message not found');
    }
    const message = this.messages[currentMessageIndex];
    this.messages.splice(currentMessageIndex, 1);
    return message;
  }
}
