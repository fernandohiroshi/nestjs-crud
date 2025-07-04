import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, throwError } from 'rxjs';

@Injectable()
export class ErrorHandlingInterceptor implements NestInterceptor {
  // eslint-disable-next-line @typescript-eslint/require-await
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    console.log(`ErrorHandlingInterceptor start...`);

    return next.handle().pipe(
      catchError((err) => {
        return throwError(() => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (err.name === 'NotFoundException') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return new BadRequestException(err.message);
          }

          return new BadRequestException('Unknown error!!!');
        });
      }),
    );
  }
}
