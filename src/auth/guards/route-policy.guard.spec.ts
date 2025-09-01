import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoutePolicyGuard } from './route-policy.guard';
import { REQUEST_TOKEN_PAYLOAD_KEY, ROUTE_POLICY_KEY } from '../auth.constants';
import { RoutePolicies } from '../enum/route-policies.enum';

describe('RoutePolicyGuard', () => {
  let guard: RoutePolicyGuard;
  let reflector: Partial<Reflector>;
  let ctx: ExecutionContext;
  let request: any;

  beforeEach(() => {
    reflector = {
      get: jest.fn(),
    };
    guard = new RoutePolicyGuard(reflector as Reflector);
    request = {};
    ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;
  });

  it('should allow if no route policy required', async () => {
    (reflector.get as jest.Mock).mockReturnValue(undefined);
    expect(await guard.canActivate(ctx)).toBe(true);
  });

  it('should throw if no token payload and policy required', async () => {
    (reflector.get as jest.Mock).mockReturnValue(RoutePolicies.findAllUsers);
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should allow if token payload exists and policy required', async () => {
    (reflector.get as jest.Mock).mockReturnValue(RoutePolicies.findAllUsers);
    request[REQUEST_TOKEN_PAYLOAD_KEY] = { user: { id: 1, active: true } };
    expect(await guard.canActivate(ctx)).toBe(true);
  });
});
