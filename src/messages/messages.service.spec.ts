import { MessagesService } from './messages.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TokenPayloadDto } from '../auth/dto/token-payload.dto';

describe('MessagesService', () => {
  const forbiddenPayload: TokenPayloadDto = {
    sub: 3,
    email: 'other@email.com',
    iat: 0,
    exp: 0,
    aud: '',
    iss: ''
  };
  const ownerPayload: TokenPayloadDto = {
    sub: 2,
    email: 'owner@email.com',
    iat: 0,
    exp: 0,
    aud: '',
    iss: ''
  };

  let service: MessagesService;
  let messageRepository: any;
  let userService: any;

  beforeEach(() => {
    messageRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };
    userService = { findOne: jest.fn() };
    service = new MessagesService(messageRepository, userService);
  });

  // findAll: returns paginated messages
  it('findAll - should return paginated messages', async () => {
    const messages = [{ id: 1 }, { id: 2 }];
    messageRepository.find.mockResolvedValue(messages);
    const result = await service.findAll({ limit: 2, offset: 0 });
    expect(result).toEqual(messages);
    expect(messageRepository.find).toHaveBeenCalledWith({
      take: 2,
      skip: 0,
      relations: ['from', 'to'],
      order: { id: 'desc' },
      select: {
        from: { id: true, name: true },
        to: { id: true, name: true },
      },
    });
  });

  // findById: returns message or throws NotFoundException
  it('findById - should return message if found', async () => {
    messageRepository.findOne.mockResolvedValue({ id: 1 });
    expect(await service.findById(1)).toEqual({ id: 1 });
  });
  it('findById - should throw NotFoundException if not found', async () => {
    messageRepository.findOne.mockResolvedValue(null);
    await expect(service.findById(2)).rejects.toThrow(NotFoundException);
  });

  // create: integrates with userService, returns correct object
  it('create - should create a message and return it', async () => {
    userService.findOne.mockResolvedValueOnce({
  id: 2,
  email: 'to@email.com',
  passwordHash: 'hash',
  name: 'to',
  sentMessages: [],
  receivedMessages: [],
  active: true,
  picture: '',
});
    userService.findOne.mockResolvedValueOnce({
  id: 1,
  email: 'from@email.com',
  passwordHash: 'hash',
  name: 'from',
  sentMessages: [],
  receivedMessages: [],
  active: true,
  picture: '',
});
    messageRepository.create.mockReturnValue({
  id: 10,
  text: 'msg',
  read: false,
  date: new Date(),
  from: {
    id: 1,
    email: 'from@email.com',
    passwordHash: 'hash',
    name: 'from',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
  to: {
    id: 2,
    email: 'to@email.com',
    passwordHash: 'hash',
    name: 'to',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
});
    messageRepository.save.mockResolvedValue();
    const dto = { toId: 2, text: 'msg' };
    const tokenPayload: TokenPayloadDto = {
  sub: 1,
  email: 'from@email.com',
  iat: 0,
  exp: 0,
  aud: '',
  iss: ''
};
    const result = await service.create(dto, tokenPayload);
    expect(result.from).toEqual({ id: 1, name: 'from' });
    expect(result.to).toEqual({ id: 2, name: 'to' });
    expect(result.text).toBe('msg');
  });

  // update: only allows update if owner, throws Forbidden if not
  it('update - should throw ForbiddenException if not owner', async () => {
    jest.spyOn(service, 'findById').mockResolvedValue({
  id: 1,
  text: 'msg',
  read: false,
  date: new Date(),
  from: {
    id: 2,
    email: 'owner@email.com',
    passwordHash: 'hash',
    name: 'owner',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
  to: {
    id: 3,
    email: 'to@email.com',
    passwordHash: 'hash',
    name: 'to',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
});
    await expect(service.update(1, {}, forbiddenPayload)).rejects.toThrow(ForbiddenException);
  });

  // update: updates message if owner
  it('update - should update message if owner', async () => {
    const message = {
  id: 1,
  text: 'old',
  read: false,
  date: new Date(),
  from: {
    id: 2,
    email: 'owner@email.com',
    passwordHash: 'hash',
    name: 'owner',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
  to: {
    id: 3,
    email: 'to@email.com',
    passwordHash: 'hash',
    name: 'to',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
};
    jest.spyOn(service, 'findById').mockResolvedValue(message);
    messageRepository.save.mockResolvedValue({ ...message, text: 'new', read: true });
    const result = await service.update(1, { text: 'new', read: true }, ownerPayload);
    expect(result.text).toBe('new');
    expect(result.read).toBe(true);
  });

  // deleteById: only allows delete if owner, throws Forbidden/NotFound if not
  it('deleteById - should throw NotFoundException if message not found', async () => {
    messageRepository.findOne.mockResolvedValue(null);
    const notFoundPayload: TokenPayloadDto = {
  sub: 1,
  email: 'user@email.com',
  iat: 0,
  exp: 0,
  aud: '',
  iss: ''
};
await expect(service.deleteById(1, notFoundPayload)).rejects.toThrow(NotFoundException);
  });
  it('deleteById - should throw ForbiddenException if not owner', async () => {
    messageRepository.findOne.mockResolvedValue({
  id: 1,
  text: 'msg',
  read: false,
  date: new Date(),
  from: {
    id: 2,
    email: 'owner@email.com',
    passwordHash: 'hash',
    name: 'owner',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
  to: {
    id: 3,
    email: 'to@email.com',
    passwordHash: 'hash',
    name: 'to',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
});
    await expect(service.deleteById(1, forbiddenPayload)).rejects.toThrow(ForbiddenException);
  });
  it('deleteById - should remove message if owner', async () => {
    const msg = {
  id: 1,
  text: 'msg',
  read: false,
  date: new Date(),
  from: {
    id: 2,
    email: 'owner@email.com',
    passwordHash: 'hash',
    name: 'owner',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
  to: {
    id: 3,
    email: 'to@email.com',
    passwordHash: 'hash',
    name: 'to',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
};
    messageRepository.findOne.mockResolvedValue(msg);
    messageRepository.remove.mockResolvedValue(msg);
    const result = await service.deleteById(1, ownerPayload);
    expect(result).toEqual(msg);
  });
  it('findById - should throw NotFoundException if not found', async () => {
    messageRepository.findOne.mockResolvedValue(null);
    await expect(service.findById(2)).rejects.toThrow(NotFoundException);
  });

  // create: integrates with userService, returns correct object
  it('create - should create a message and return it', async () => {
    userService.findOne.mockResolvedValueOnce({
  id: 2,
  email: 'to@email.com',
  passwordHash: 'hash',
  name: 'to',
  sentMessages: [],
  receivedMessages: [],
  active: true,
  picture: '',
});
    userService.findOne.mockResolvedValueOnce({
  id: 1,
  email: 'from@email.com',
  passwordHash: 'hash',
  name: 'from',
  sentMessages: [],
  receivedMessages: [],
  active: true,
  picture: '',
});
    messageRepository.create.mockReturnValue({
  id: 10,
  text: 'msg',
  read: false,
  date: new Date(),
  from: {
    id: 1,
    email: 'from@email.com',
    passwordHash: 'hash',
    name: 'from',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
  to: {
    id: 2,
    email: 'to@email.com',
    passwordHash: 'hash',
    name: 'to',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
});
    messageRepository.save.mockResolvedValue();
    const dto = { toId: 2, text: 'msg' };
    const tokenPayload: TokenPayloadDto = {
  sub: 1,
  email: 'from@email.com',
  iat: 0,
  exp: 0,
  aud: '',
  iss: ''
};
    const result = await service.create(dto, tokenPayload);
    expect(result.from).toEqual({ id: 1, name: 'from' });
    expect(result.to).toEqual({ id: 2, name: 'to' });
    expect(result.text).toBe('msg');
  });

  // update: only allows update if owner, throws Forbidden if not
  it('update - should throw ForbiddenException if not owner', async () => {
    jest.spyOn(service, 'findById').mockResolvedValue({
  id: 1,
  text: 'msg',
  read: false,
  date: new Date(),
  from: {
    id: 2,
    email: 'owner@email.com',
    passwordHash: 'hash',
    name: 'owner',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
  to: {
    id: 3,
    email: 'to@email.com',
    passwordHash: 'hash',
    name: 'to',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
});
    await expect(service.update(1, {}, forbiddenPayload)).rejects.toThrow(ForbiddenException);
  });

  // update: updates message if owner
  it('update - should update message if owner', async () => {
    const message = {
  id: 1,
  text: 'old',
  read: false,
  date: new Date(),
  from: {
    id: 2,
    email: 'owner@email.com',
    passwordHash: 'hash',
    name: 'owner',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
  to: {
    id: 3,
    email: 'to@email.com',
    passwordHash: 'hash',
    name: 'to',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
};
    jest.spyOn(service, 'findById').mockResolvedValue(message);
    messageRepository.save.mockResolvedValue({ ...message, text: 'new', read: true });
    const result = await service.update(1, { text: 'new', read: true }, ownerPayload);
    expect(result.text).toBe('new');
    expect(result.read).toBe(true);
  });

  // deleteById: only allows delete if owner, throws Forbidden/NotFound if not
  it('deleteById - should throw NotFoundException if message not found', async () => {
    messageRepository.findOne.mockResolvedValue(null);
    const notFoundPayload: TokenPayloadDto = {
  sub: 1,
  email: 'user@email.com',
  iat: 0,
  exp: 0,
  aud: '',
  iss: ''
};
await expect(service.deleteById(1, notFoundPayload)).rejects.toThrow(NotFoundException);
  });
  it('deleteById - should throw ForbiddenException if not owner', async () => {
    messageRepository.findOne.mockResolvedValue({
  id: 1,
  text: 'msg',
  read: false,
  date: new Date(),
  from: {
    id: 2,
    email: 'owner@email.com',
    passwordHash: 'hash',
    name: 'owner',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
  to: {
    id: 3,
    email: 'to@email.com',
    passwordHash: 'hash',
    name: 'to',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
});
    await expect(service.deleteById(1, forbiddenPayload)).rejects.toThrow(ForbiddenException);
  });
  it('deleteById - should remove message if owner', async () => {
    const msg = {
  id: 1,
  text: 'msg',
  read: false,
  date: new Date(),
  from: {
    id: 2,
    email: 'owner@email.com',
    passwordHash: 'hash',
    name: 'owner',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
  to: {
    id: 3,
    email: 'to@email.com',
    passwordHash: 'hash',
    name: 'to',
    sentMessages: [],
    receivedMessages: [],
    active: true,
    picture: '',
  },
};
    messageRepository.findOne.mockResolvedValue(msg);
    messageRepository.remove.mockResolvedValue(msg);
    const result = await service.deleteById(1, ownerPayload);
    expect(result).toEqual(msg);
  });
});
