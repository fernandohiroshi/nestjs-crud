import { extractReqDataParam } from './req-data-param.decorator';
import { ExecutionContext } from '@nestjs/common';

describe('ReqDataParam', () => {
  it('should extract the correct property from the request', () => {
    const mockRequest = { user: { name: 'Test' }, headers: { foo: 'bar' } };
    const mockCtx = {
      switchToHttp: () => ({ getRequest: () => mockRequest }),
    } as unknown as ExecutionContext;

    // Simulate decorator factory usage
    expect(extractReqDataParam('user' as keyof typeof mockRequest, mockCtx)).toEqual({ name: 'Test' });
    expect(extractReqDataParam('headers' as keyof typeof mockRequest, mockCtx)).toEqual({ foo: 'bar' });
  });
});
