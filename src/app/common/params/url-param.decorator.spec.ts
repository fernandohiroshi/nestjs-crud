import { extractUrlParam } from './url-param.decorator';
import { ExecutionContext } from '@nestjs/common';

describe('UrlParam', () => {
  it('should extract the url from the request', () => {
    const mockRequest = { url: '/some/url' };
    const mockCtx = {
      switchToHttp: () => ({ getRequest: () => mockRequest }),
    } as unknown as ExecutionContext;
    expect(extractUrlParam({}, mockCtx)).toBe('/some/url');
  });
});
