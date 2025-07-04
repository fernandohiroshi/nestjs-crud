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
    console.log(`TimingConnectionInterceptor - START TIME: ${timeStart}`);

    return next.handle().pipe(
      tap(() => {
        const timeEnd = Date.now() - timeStart;
        console.log(`TimingConnectionInterceptor END TIME: ${timeEnd}`);
      }),
    );
  }
}
