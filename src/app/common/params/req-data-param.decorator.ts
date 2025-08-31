import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const ReqDataParam: any = createParamDecorator(
  (data: keyof Request, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request[data];
  },
);
