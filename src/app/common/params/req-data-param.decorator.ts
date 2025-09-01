import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export function extractReqDataParam(data: string, ctx: ExecutionContext) {
  const request = ctx.switchToHttp().getRequest<Request>();
  return request[data];
}

export const ReqDataParam: any = createParamDecorator(extractReqDataParam);
