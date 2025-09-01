import { ExecutionContext } from '@nestjs/common';
import { IsAdminGuard } from './is-admin.guard';

describe('IsAdminGuard', () => {
  let guard: IsAdminGuard;
  let mockContext: Partial<ExecutionContext>;
  let mockRequest: any;

  beforeEach(() => {
    guard = new IsAdminGuard();
    mockRequest = {};
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as any;
  });

  it('should allow access for admin user', () => {
    mockRequest.user = { role: 'admin' };
    expect(guard.canActivate(mockContext as ExecutionContext)).toBe(true);
  });

  it('should deny access for non-admin user', () => {
    mockRequest.user = { role: 'user' };
    expect(guard.canActivate(mockContext as ExecutionContext)).toBe(false);
  });

  it('should deny access if user is missing', () => {
    mockRequest.user = undefined;
    expect(guard.canActivate(mockContext as ExecutionContext)).toBe(false);
  });

  it('should deny access if role is missing', () => {
    mockRequest.user = {};
    expect(guard.canActivate(mockContext as ExecutionContext)).toBe(false);
  });
});
