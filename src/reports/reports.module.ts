import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [CommonModule, AiModule],
  providers: [ReportsService],
  controllers: [ReportsController],
})
export class ReportsModule {}
