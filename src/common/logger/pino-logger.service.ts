import { Injectable } from '@nestjs/common';
import pino from 'pino';

export interface SecurityEvent {
  type:
    | 'AUTH_FAILED'
    | 'AUTH_SUCCESS'
    | 'ACCESS_DENIED'
    | 'RATE_LIMIT'
    | 'INJECTION_ATTEMPT'
    | 'IDOR_ATTEMPT';
  userId?: string;
  username?: string;
  endpoint?: string;
  details?: Record<string, unknown>;
  requestId?: string;
  timestamp?: string;
}

@Injectable()
export class LoggerService {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      redact: {
        paths: [
          'req.headers.authorization',
          'req.body.password',
          'req.body.secret',
          'req.body.token',
          'password',
          'secret',
          'token',
          'apiKey',
        ],
        remove: true,
      },
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          singleLine: process.env.NODE_ENV === 'production',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  debug(message: string, meta?: Record<string, unknown>) {
    this.logger.debug({ ...meta }, message);
  }

  info(message: string, meta?: Record<string, unknown>) {
    this.logger.info({ ...meta }, message);
  }

  warn(message: string, meta?: Record<string, unknown>) {
    this.logger.warn({ ...meta }, message);
  }

  error(
    message: string,
    error?: Error | string,
    meta?: Record<string, unknown>,
  ) {
    if (error instanceof Error) {
      this.logger.error({ ...meta, stack: error.stack }, message);
    } else if (typeof error === 'string') {
      this.logger.error({ ...meta, error }, message);
    } else if (error) {
      this.logger.error({ ...meta, error }, message);
    } else {
      this.logger.error(meta, message);
    }
  }

  securityEvent(event: SecurityEvent) {
    this.logger.warn(
      {
        type: event.type,
        userId: event.userId,
        username: event.username,
        endpoint: event.endpoint,
        requestId: event.requestId,
        timestamp: event.timestamp || new Date().toISOString(),
        ...event.details,
      },
      `[SECURITY] ${event.type}`,
    );
  }
}
