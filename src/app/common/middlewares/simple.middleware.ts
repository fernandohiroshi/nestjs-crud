import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export class SimpleMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('HELLO I AM MIDDLEWARE.');
    const authorization = req.headers?.authorization;

    if (authorization) {
      req['user'] = {
        name: 'Ragnar',
        descripton: 'Test...',
      };
    }

    next();
  }
}
