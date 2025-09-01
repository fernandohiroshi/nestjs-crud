import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export function extractUrlParam(data: unknown, ctx: ExecutionContext) {
  const context = ctx.switchToHttp();
  const request: Request = context.getRequest();
  return request.url;
}

export const UrlParam = createParamDecorator(extractUrlParam);
