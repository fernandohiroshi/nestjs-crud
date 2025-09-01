import { MessagesController } from './messages.controller';

describe('MessagesController', () => {
  let controller: MessagesController;
  let service: any;

  beforeEach(() => {
    service = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteById: jest.fn(),
    };
    controller = new MessagesController(service);
  });

  it('findAll - should call service.findAll and return result', async () => {
    const expected = [{ id: 1 }];
    service.findAll.mockResolvedValue(expected);
    const result = await controller.findAll({ limit: 2, offset: 0 });
    expect(service.findAll).toHaveBeenCalledWith({ limit: 2, offset: 0 });
    expect(result).toEqual(expected);
  });

  it('findById - should call service.findById and return result', async () => {
    const expected = { id: 1 };
    service.findById.mockResolvedValue(expected);
    const result = await controller.findById(1);
    expect(service.findById).toHaveBeenCalledWith(1);
    expect(result).toEqual(expected);
  });

  it('create - should call service.create and return result', async () => {
    const dto = { toId: 2, text: 'msg' };
    const token = {
      sub: 1,
      email: 'user@email.com',
      iat: 0,
      exp: 0,
      aud: '',
      iss: '',
    };
    const expected = { id: 1, text: 'msg' };
    service.create.mockResolvedValue(expected);
    const result = await controller.create(dto, token);
    expect(service.create).toHaveBeenCalledWith(dto, token);
    expect(result).toEqual(expected);
  });

  it('update - should call service.update and return result', async () => {
    const id = 1;
    const dto = { text: 'edit' };
    const token = {
      sub: 1,
      email: 'user@email.com',
      iat: 0,
      exp: 0,
      aud: '',
      iss: '',
    };
    const expected = { id: 1, text: 'edit' };
    service.update.mockResolvedValue(expected);
    const result = await controller.update(id, dto, token);
    expect(service.update).toHaveBeenCalledWith(id, dto, token);
    expect(result).toEqual(expected);
  });

  it('deleteById - should call service.deleteById and return result', async () => {
    const id = 1;
    const token = {
      sub: 1,
      email: 'user@email.com',
      iat: 0,
      exp: 0,
      aud: '',
      iss: '',
    };
    const expected = { id: 1 };
    service.deleteById.mockResolvedValue(expected);
    const result = await controller.deleteById(id, token);
    expect(service.deleteById).toHaveBeenCalledWith(id, token);
    expect(result).toEqual(expected);
  });
});
