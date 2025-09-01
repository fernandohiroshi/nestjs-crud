import { BcryptService } from './bcrypt.service';
import * as bcrypt from 'bcrypt';

describe('BcryptService', () => {
  let service: BcryptService;

  beforeEach(() => {
    service = new BcryptService();
  });

  it('should hash and compare a password (integration)', async () => {
    const password = 'mySecret123!';
    const hash = await service.hash(password);
    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(password);
    const result = await service.compare(password, hash);
    expect(result).toBe(true);
  });

  it('should return false for wrong password', async () => {
    const hash = await service.hash('password1');
    const result = await service.compare('wrong', hash);
    expect(result).toBe(false);
  });

  it('should use bcrypt.genSalt and bcrypt.hash', async () => {
    const genSaltSpy = jest.spyOn(bcrypt, 'genSalt');
    const hashSpy = jest.spyOn(bcrypt, 'hash');
    await service.hash('abc');
    expect(genSaltSpy).toHaveBeenCalled();
    expect(hashSpy).toHaveBeenCalled();
  });

  it('should use bcrypt.compare', async () => {
    const compareSpy = jest.spyOn(bcrypt, 'compare');
    await service.compare('a', 'b');
    expect(compareSpy).toHaveBeenCalledWith('a', 'b');
  });
});
