import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface RequestWithId extends Request {
  id?: string;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithId, res: Response, next: NextFunction): void {
    const headerValue: string | string[] | undefined =
      req.headers['x-request-id'];

    const requestId: string = Array.isArray(headerValue)
      ? headerValue[0]
      : typeof headerValue === 'string'
        ? headerValue
        : uuidv4();
    req.id = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  }
}
