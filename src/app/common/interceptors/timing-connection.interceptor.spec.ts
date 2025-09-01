import { TimingConnectionInterceptor } from './timing-connection.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('TimingConnectionInterceptor', () => {
  let interceptor: TimingConnectionInterceptor;
  let mockContext: Partial<ExecutionContext>;
  let mockNext: Partial<CallHandler>;

  beforeEach(() => {
    interceptor = new TimingConnectionInterceptor();
    mockContext = {} as Partial<ExecutionContext>;
    mockNext = {
      handle: jest.fn(() => of('timed-data')),
    };
  });

  it('should call next.handle and measure timing', async () => {
    const spy = jest.spyOn(Date, 'now');
    spy.mockReturnValueOnce(1000).mockReturnValueOnce(2000); // simulate 1s elapsed
    const result$ = await interceptor.intercept(mockContext as ExecutionContext, mockNext as CallHandler);
    let value;
    result$.subscribe((v) => (value = v));
    expect(value).toBe('timed-data');
    expect(mockNext.handle).toHaveBeenCalled();
    spy.mockRestore();
  });
});
