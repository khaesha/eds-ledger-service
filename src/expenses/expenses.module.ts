import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [CommonModule, AiModule],
  providers: [ExpensesService],
  controllers: [ExpensesController],
})
export class ExpensesModule {}
