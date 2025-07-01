import { Injectable } from '@nestjs/common';
import { MessageEntity } from './entities/message.entity';

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
    return this.messages.find((message) => message.id === +id);
  }

  create(body: any) {
    this.lastId++;
    const id = this.lastId;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const newMessage = {
      id,
      ...body,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.messages.push(newMessage);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return newMessage;
  }

  update(id: string, body: any) {
    const currentMessageIndex = this.messages.findIndex(
      (message) => message.id === +id,
    );

    if (currentMessageIndex >= 0) {
      const currentMessage = this.messages[currentMessageIndex];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.messages[currentMessageIndex] = {
        ...currentMessage,
        ...body,
      };
    }
  }

  deleteById(id: string) {
    const currentMessageIndex = this.messages.findIndex(
      (message) => message.id === +id,
    );

    if (currentMessageIndex >= 0) {
      this.messages.splice(currentMessageIndex, 1);
    }
  }
}
