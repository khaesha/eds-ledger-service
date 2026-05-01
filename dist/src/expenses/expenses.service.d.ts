import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateExpenseDto } from './expenses.dto';
export declare class ExpensesService {
    private readonly prisma;
    private readonly ai;
    constructor(prisma: PrismaService, ai: AiService);
    findAll(userId: string): Promise<{
        id: string;
        createdAt: Date;
        description: string;
        amount: number;
        date: Date;
        userId: string;
        category: string;
        aiNote: string | null;
    }[]>;
    create(userId: string, dto: CreateExpenseDto): Promise<{
        id: string;
        createdAt: Date;
        description: string;
        amount: number;
        date: Date;
        userId: string;
        category: string;
        aiNote: string | null;
    }>;
    remove(userId: string, expenseId: string): Promise<{
        id: string;
        createdAt: Date;
        description: string;
        amount: number;
        date: Date;
        userId: string;
        category: string;
        aiNote: string | null;
    }>;
    importCsv(userId: string, filePath: string): Promise<{
        imported: number;
    }>;
}
