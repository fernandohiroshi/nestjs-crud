import { ExecutionContext } from '@nestjs/common';
import { TokenPayloadParam } from './token-payload.param';

describe('TokenPayloadParam', () => {
  let ctx: Partial<ExecutionContext>;
  let request: any;

  beforeEach(() => {
    request = {};
    ctx = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  });

  it('should be a function (decorator)', () => {
    expect(typeof TokenPayloadParam).toBe('function');
  });
});
