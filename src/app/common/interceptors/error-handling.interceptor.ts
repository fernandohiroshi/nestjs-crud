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
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    return next.handle().pipe(
      catchError((err) => {
        return throwError(() => {
          if (err.name === 'NotFoundException') {
            return new BadRequestException(err.message);
          }

          return new BadRequestException('Unknown error!!!');
        });
      }),
    );
  }
}
