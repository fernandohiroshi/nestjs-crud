import { CallHandler, ExecutionContext } from '@nestjs/common';
import { ChangeDataInterceptor } from './change-data.interceptor';
import { of } from 'rxjs';

describe('ChangeDataInterceptor', () => {
  let interceptor: ChangeDataInterceptor;
  let mockContext: Partial<ExecutionContext>;
  let next: CallHandler;

  beforeEach(() => {
    interceptor = new ChangeDataInterceptor();
    mockContext = {} as any;
  });

  it('should wrap array data with count', done => {
    next = { handle: () => of([1, 2, 3]) } as any;
    interceptor.intercept(mockContext as ExecutionContext, next).subscribe(result => {
      expect(result).toEqual({ data: [1, 2, 3], count: 3 });
      done();
    });
  });

  it('should return object data as is', done => {
    next = { handle: () => of({ foo: 'bar' }) } as any;
    interceptor.intercept(mockContext as ExecutionContext, next).subscribe(result => {
      expect(result).toEqual({ foo: 'bar' });
      done();
    });
  });
});
