import { ExecutionContext } from '@nestjs/common';
import { AuthAndPolicyGuard } from './auth-and-policy.guard';
import { AuthTokenGuard } from './auth-token.guard';
import { RoutePolicyGuard } from './route-policy.guard';

describe('AuthAndPolicyGuard', () => {
  let guard: AuthAndPolicyGuard;
  let mockAuthTokenGuard: Partial<AuthTokenGuard>;
  let mockRoutePolicyGuard: Partial<RoutePolicyGuard>;
  let ctx: ExecutionContext;

  beforeEach(() => {
    mockAuthTokenGuard = {
      canActivate: jest.fn(),
    };
    mockRoutePolicyGuard = {
      canActivate: jest.fn(),
    };
    guard = new AuthAndPolicyGuard(
      mockAuthTokenGuard as AuthTokenGuard,
      mockRoutePolicyGuard as RoutePolicyGuard,
    );
    ctx = {} as ExecutionContext;
  });

  it('should return false if authTokenGuard fails', async () => {
    (mockAuthTokenGuard.canActivate as jest.Mock).mockResolvedValue(false);
    expect(await guard.canActivate(ctx)).toBe(false);
    expect(mockAuthTokenGuard.canActivate).toHaveBeenCalledWith(ctx);
    expect(mockRoutePolicyGuard.canActivate).not.toHaveBeenCalled();
  });

  it('should return result of routePolicyGuard if authTokenGuard passes', async () => {
    (mockAuthTokenGuard.canActivate as jest.Mock).mockResolvedValue(true);
    (mockRoutePolicyGuard.canActivate as jest.Mock).mockResolvedValue(true);
    expect(await guard.canActivate(ctx)).toBe(true);
    expect(mockAuthTokenGuard.canActivate).toHaveBeenCalledWith(ctx);
    expect(mockRoutePolicyGuard.canActivate).toHaveBeenCalledWith(ctx);
  });

  it('should return false if routePolicyGuard fails after authTokenGuard passes', async () => {
    (mockAuthTokenGuard.canActivate as jest.Mock).mockResolvedValue(true);
    (mockRoutePolicyGuard.canActivate as jest.Mock).mockResolvedValue(false);
    expect(await guard.canActivate(ctx)).toBe(false);
  });
});
