import { SimpleCacheInterceptor } from './simple-cache.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('SimpleCacheInterceptor', () => {
  let interceptor: SimpleCacheInterceptor;
  let mockContext: Partial<ExecutionContext>;
  let mockNext: Partial<CallHandler>;
  let req: any;

  beforeEach(() => {
    interceptor = new SimpleCacheInterceptor();
    req = { url: '/test' };
    mockContext = {
      switchToHttp: () => ({ getRequest: () => req }),
    } as Partial<ExecutionContext>;
    mockNext = {
      handle: jest.fn(() => of('fresh-data')),
    };
  });

  it('should return cached value if present', async () => {
    // Pre-populate cache
    (interceptor as any).cache.set('/test', 'cached-data');
    const result$ = await interceptor.intercept(mockContext as ExecutionContext, mockNext as CallHandler);
    let value;
    result$.subscribe((v) => (value = v));
    expect(value).toBe('cached-data');
    expect(mockNext.handle).not.toHaveBeenCalled();
  });

  it('should call next.handle and cache the result if not cached', async () => {
    const result$ = await interceptor.intercept(mockContext as ExecutionContext, mockNext as CallHandler);
    let value;
    result$.subscribe((v) => (value = v));
    expect(value).toBe('fresh-data');
    expect(mockNext.handle).toHaveBeenCalled();
    // Should cache the value
    expect((interceptor as any).cache.get('/test')).toBe('fresh-data');
  });
});
