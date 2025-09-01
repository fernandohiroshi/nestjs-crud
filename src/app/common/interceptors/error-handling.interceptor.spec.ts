import { CallHandler, ExecutionContext, BadRequestException } from '@nestjs/common';
import { ErrorHandlingInterceptor } from './error-handling.interceptor';
import { of, throwError, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

describe('ErrorHandlingInterceptor', () => {
  let interceptor: ErrorHandlingInterceptor;
  let mockContext: Partial<ExecutionContext>;

  beforeEach(() => {
    interceptor = new ErrorHandlingInterceptor();
    mockContext = {} as any;
  });

  function runAndCatch<T>(observable: Observable<T>, onError: (err: any) => void, onComplete: () => void) {
    observable.pipe(
      catchError((err) => {
        onError(err);
        onComplete();
        return of(null);
      })
    ).subscribe();
  }

  it('should convert NotFoundException to BadRequestException', async () => {
    const next: CallHandler = {
      handle: () => throwError(() => ({ name: 'NotFoundException', message: 'not found' })),
    };
    const observable = await interceptor.intercept(mockContext as ExecutionContext, next);
    await new Promise<void>((resolve) => {
      runAndCatch(
        observable,
        (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.message).toContain('not found');
        },
        resolve
      );
    });
  });

  it('should convert unknown errors to BadRequestException with generic message', async () => {
    const next: CallHandler = {
      handle: () => throwError(() => ({ name: 'OtherError', message: 'fail' })),
    };
    const observable = await interceptor.intercept(mockContext as ExecutionContext, next);
    await new Promise<void>((resolve) => {
      runAndCatch(
        observable,
        (err) => {
          expect(err).toBeInstanceOf(BadRequestException);
          expect(err.message).toContain('Unknown error');
        },
        resolve
      );
    });
  });
});
