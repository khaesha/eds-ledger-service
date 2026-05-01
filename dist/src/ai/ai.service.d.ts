import { ConfigService } from '@nestjs/config';
export interface CategorizedExpense {
    description: string;
    category: string;
    ai_note: string;
}
export interface ReportResult {
    score: number;
    score_reason: string;
    summary: string;
    leaks: {
        name: string;
        amount: number;
        tip: string;
    }[];
    wins: string[];
}
export declare class AiService {
    private readonly config;
    private readonly client;
    constructor(config: ConfigService);
    categorizeExpenses(expenses: {
        description: string;
        amount: number;
    }[]): Promise<CategorizedExpense[]>;
    generateMonthlyReport(categoryTotals: Record<string, number>, totalSpent: number): Promise<ReportResult>;
    chat(userMessage: string, categoryTotals: Record<string, number>): Promise<string>;
}
