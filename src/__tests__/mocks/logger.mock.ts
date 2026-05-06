import { LoggerService } from '../../common/logger/pino-logger.service';

export const createMockLoggerService = (): Partial<LoggerService> => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  securityEvent: jest.fn(),
});
