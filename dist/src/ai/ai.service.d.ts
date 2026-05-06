import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../common/logger/pino-logger.service';
import { type CategorizedExpense, type ReportResult } from './ai.schemas';
export declare class AiService {
    private readonly config;
    private readonly logger;
    private readonly client;
    constructor(config: ConfigService, logger: LoggerService);
    categorizeExpenses(expenses: {
        description: string;
        amount: number;
    }[]): Promise<CategorizedExpense[]>;
    generateMonthlyReport(categoryTotals: Record<string, number>, totalSpent: number): Promise<ReportResult>;
    chat(userMessage: string, categoryTotals: Record<string, number>): Promise<string>;
}
export type { CategorizedExpense, ReportResult };
