import { Module } from '@nestjs/common';
import { LoggerService } from './logger/pino-logger.service';

@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class CommonModule {}
