import { MessageEntity } from './message.entity';
import { User } from 'src/users/entities/user.entity';

describe('MessageEntity', () => {
  it('should instantiate with required fields', () => {
    const msg = new MessageEntity();
    msg.id = 1;
    msg.text = 'test';
    msg.read = false;
    msg.date = new Date();
    msg.from = { id: 2, name: 'from', email: 'f@f.com', passwordHash: '', sentMessages: [], receivedMessages: [], active: true, picture: '' } as User;
    msg.to = { id: 3, name: 'to', email: 't@t.com', passwordHash: '', sentMessages: [], receivedMessages: [], active: true, picture: '' } as User;
    expect(msg.id).toBe(1);
    expect(msg.text).toBe('test');
    expect(msg.read).toBe(false);
    expect(msg.from.name).toBe('from');
    expect(msg.to.name).toBe('to');
  });

  it('should allow setting createdAt and updatedAt', () => {
    const msg = new MessageEntity();
    const now = new Date();
    msg.createdAt = now;
    msg.updatedAt = now;
    expect(msg.createdAt).toBe(now);
    expect(msg.updatedAt).toBe(now);
  });
});
