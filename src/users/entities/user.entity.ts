import { IsEmail } from 'class-validator';
import { MessageEntity } from 'src/messages/entities/message.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ length: 100 })
  passwordHash: string;

  @Column({ length: 100 })
  name: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @OneToMany(() => MessageEntity, (message) => message.from)
  sentMessages: MessageEntity[];

  @OneToMany(() => MessageEntity, (message) => message.to)
  receivedMessages: MessageEntity[];

  @Column({ default: true })
  active: boolean;

  @Column({ default: '' })
  picture: string;

  // @Column({ type: 'simple-array', default: [] })
  // routePolicies: RoutePolicies[];
}
