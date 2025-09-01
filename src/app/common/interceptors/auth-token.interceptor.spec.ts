import { CallHandler, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthTokenInteceptor } from './auth-token.interceptor';

describe('AuthTokenInteceptor', () => {
  let interceptor: AuthTokenInteceptor;
  let mockContext: Partial<ExecutionContext>;
  let mockRequest: any;
  let next: CallHandler;

  beforeEach(() => {
    interceptor = new AuthTokenInteceptor();
    mockRequest = { headers: {} };
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;
    next = { handle: jest.fn().mockReturnValue('handled') } as any;
  });

  it('should throw UnauthorizedException if no token is present', () => {
    expect(() => interceptor.intercept(mockContext as ExecutionContext, next)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token is invalid', () => {
    mockRequest.headers.authorization = 'Bearer wrong-token';
    expect(() => interceptor.intercept(mockContext as ExecutionContext, next)).toThrow(UnauthorizedException);
  });

  it('should call next.handle if token is valid', () => {
    mockRequest.headers.authorization = 'Bearer 123456';
    const result = interceptor.intercept(mockContext as ExecutionContext, next);
    expect(result).toBe('handled');
  });
});
