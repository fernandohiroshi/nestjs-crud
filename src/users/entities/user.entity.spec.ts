import { User } from './user.entity';
import { MessageEntity } from 'src/messages/entities/message.entity';

describe('User Entity', () => {
  it('should instantiate with required fields', () => {
    const user = new User();
    user.id = 1;
    user.email = 'test@email.com';
    user.passwordHash = 'hash';
    user.name = 'Test';
    user.active = true;
    user.picture = '';
    user.sentMessages = [];
    user.receivedMessages = [];
    expect(user.id).toBe(1);
    expect(user.email).toBe('test@email.com');
    expect(user.name).toBe('Test');
    expect(user.active).toBe(true);
  });

  it('should allow setting createdAt and updatedAt', () => {
    const user = new User();
    const now = new Date();
    user.createdAt = now;
    user.updatedAt = now;
    expect(user.createdAt).toBe(now);
    expect(user.updatedAt).toBe(now);
  });

  it('should allow adding sent and received messages', () => {
    const user = new User();
    const msg = new MessageEntity();
    user.sentMessages = [msg];
    user.receivedMessages = [msg];
    expect(user.sentMessages.length).toBe(1);
    expect(user.receivedMessages.length).toBe(1);
  });
});
