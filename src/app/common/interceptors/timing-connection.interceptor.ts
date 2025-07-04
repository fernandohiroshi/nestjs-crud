import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { tap } from 'rxjs';

@Injectable()
export class TimingConnectionInterceptor implements NestInterceptor {
  // eslint-disable-next-line @typescript-eslint/require-await
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const timeStart = Date.now();

    return next.handle().pipe(
      tap(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const timeEnd = Date.now() - timeStart;
      }),
    );
  }
}
