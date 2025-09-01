import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenGuard } from './auth-token.guard';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../auth.constants';

describe('AuthTokenGuard', () => {
  let guard: AuthTokenGuard;
  let userRepository: Partial<Repository<User>>;
  let jwtService: Partial<JwtService>;
  let jwtConfiguration: any;
  let ctx: ExecutionContext;
  let request: any;

  beforeEach(() => {
    userRepository = {
      findOneBy: jest.fn(),
    };
    jwtService = {
      verifyAsync: jest.fn(),
    };
    jwtConfiguration = {};
    guard = new AuthTokenGuard(
      userRepository as any,
      jwtService as any,
      jwtConfiguration,
    );
    request = { headers: {}, [REQUEST_TOKEN_PAYLOAD_KEY]: undefined };
    ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  });

  it('should throw if no token is present', async () => {
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw if token is invalid', async () => {
    request.headers.authorization = 'Bearer invalidtoken';
    (jwtService.verifyAsync as jest.Mock).mockRejectedValue(new Error('jwt error'));
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw if user not found', async () => {
    request.headers.authorization = 'Bearer validtoken';
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue({ sub: 123 });
    (userRepository.findOneBy as jest.Mock).mockResolvedValue(undefined);
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should set payload and return true if valid', async () => {
    request.headers.authorization = 'Bearer validtoken';
    const user = { id: 123, active: true };
    const payload = { sub: 123 };
    (jwtService.verifyAsync as jest.Mock).mockResolvedValue(payload);
    (userRepository.findOneBy as jest.Mock).mockResolvedValue(user);
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
    expect(request[REQUEST_TOKEN_PAYLOAD_KEY]).toMatchObject({ sub: 123, user });
  });

  it('should extract token from header', () => {
    request.headers.authorization = 'Bearer testtoken';
    expect(guard.extractTokenFromHeader(request)).toBe('testtoken');
  });

  it('should return undefined if no auth header', () => {
    expect(guard.extractTokenFromHeader({} as any)).toBeUndefined();
  });
});
