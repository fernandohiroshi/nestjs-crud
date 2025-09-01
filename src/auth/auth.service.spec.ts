import { AuthService } from './auth.service';

// Mock console.error to avoid log pollution during error scenario tests
// This is useful because AuthService calls console.error before throwing UnauthorizedException
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let hashingService: any;
  let jwtService: any;
  let jwtConfiguration: any;

  beforeEach(() => {
    userRepository = { findOneBy: jest.fn() };
    hashingService = { compare: jest.fn() };
    jwtService = { signAsync: jest.fn(), verifyAsync: jest.fn() };
    jwtConfiguration = { audience: '', issuer: '', secret: '', ttl: 1, refreshTtl: 1 };
    service = new AuthService(
      userRepository,
      hashingService,
      jwtConfiguration,
      jwtService,
    );
  });

  // Login - success
  it('should login and return tokens', async () => {
    userRepository.findOneBy.mockResolvedValue({ id: 1, email: 'a@a.com', passwordHash: 'hash', active: true });
    hashingService.compare.mockResolvedValue(true);
    jest.spyOn(service as any, 'createTokens').mockResolvedValue({ accessToken: 'a', refreshToken: 'b' });

    const result = await service.login({ email: 'a@a.com', password: '123' });
    expect(result).toEqual({ accessToken: 'a', refreshToken: 'b' });
  });

  // Login - user not found
  it('should throw UnauthorizedException if user not found', async () => {
    userRepository.findOneBy.mockResolvedValue(null);
    await expect(service.login({ email: 'x@x.com', password: '123' })).rejects.toThrow(UnauthorizedException);
  });

  // Login - invalid password
  it('should throw UnauthorizedException if password is invalid', async () => {
    userRepository.findOneBy.mockResolvedValue({ id: 1, email: 'a@a.com', passwordHash: 'hash', active: true });
    hashingService.compare.mockResolvedValue(false);
    await expect(service.login({ email: 'a@a.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
  });

  // Refresh - success
  it('should refresh tokens when valid', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 1 });
    userRepository.findOneBy.mockResolvedValue({ id: 1, email: 'a@a.com', active: true });
    jest.spyOn(service as any, 'createTokens').mockResolvedValue({ accessToken: 'a', refreshToken: 'b' });

    const result = await service.refreshTokens({ refreshToken: 'valid' });
    expect(result).toEqual({ accessToken: 'a', refreshToken: 'b' });
  });

  // Refresh - invalid token
  it('should throw UnauthorizedException if refresh token is invalid', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));
    await expect(service.refreshTokens({ refreshToken: 'invalid' })).rejects.toThrow(UnauthorizedException);
  });

  // Refresh - user not found
  it('should throw UnauthorizedException if user not found on refresh', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 1 });
    userRepository.findOneBy.mockResolvedValue(null);
    await expect(service.refreshTokens({ refreshToken: 'valid' })).rejects.toThrow(UnauthorizedException);
  });
});
