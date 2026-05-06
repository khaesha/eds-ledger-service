import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { LoggerService } from '../common/logger/pino-logger.service';
import { CreateExpenseDto } from './expenses.dto';
export declare class ExpensesService {
    private readonly prisma;
    private readonly ai;
    private readonly logger;
    constructor(prisma: PrismaService, ai: AiService, logger: LoggerService);
    findAll(userId: string): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        description: string;
        category: string;
        date: Date;
        amount: number;
        aiNote: string | null;
    }[]>;
    create(userId: string, dto: CreateExpenseDto): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        description: string;
        category: string;
        date: Date;
        amount: number;
        aiNote: string | null;
    }>;
    remove(userId: string, expenseId: string): Promise<{
        userId: string;
        id: string;
        createdAt: Date;
        description: string;
        category: string;
        date: Date;
        amount: number;
        aiNote: string | null;
    }>;
    importCsv(userId: string, filePath: string): Promise<{
        imported: number;
    }>;
}
