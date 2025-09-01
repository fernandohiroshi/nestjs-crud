import { ExecutionContext } from '@nestjs/common';
import { TokenPayloadParam } from './token-payload.param';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../auth.constants';

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
