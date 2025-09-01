import { CallHandler, ExecutionContext } from '@nestjs/common';
import { AddHeaderInterceptor } from './add-header.interceptor';

describe('AddHeaderInterceptor', () => {
  let interceptor: AddHeaderInterceptor;
  let mockContext: Partial<ExecutionContext>;
  let mockResponse: any;
  let next: CallHandler;

  beforeEach(() => {
    interceptor = new AddHeaderInterceptor();
    mockResponse = {
      setHeader: jest.fn(),
    };
    mockContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
      }),
    } as any;
    next = { handle: jest.fn().mockReturnValue('handled') } as any;
  });

  it('should add custom header and call next.handle()', () => {
    const result = interceptor.intercept(mockContext as ExecutionContext, next);
    expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Custom-Header', 'Header value');
    expect(result).toBe('handled');
  });
});
