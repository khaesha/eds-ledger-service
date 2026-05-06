import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { AiService } from './ai.service';

@Module({
  imports: [CommonModule],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
