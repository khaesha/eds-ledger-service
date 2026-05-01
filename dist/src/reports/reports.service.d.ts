import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
export declare class ReportsService {
    private readonly prisma;
    private readonly ai;
    constructor(prisma: PrismaService, ai: AiService);
    getReport(userId: string, year: number, month: number): Promise<{
        id: string;
        year: number;
        score: number;
        summary: string;
        leaks: import("@prisma/client/runtime/client").JsonValue;
        wins: import("@prisma/client/runtime/client").JsonValue;
        userId: string;
        month: number;
        scoreReason: string;
        categoryTotals: import("@prisma/client/runtime/client").JsonValue;
        generatedAt: Date;
    }>;
    generateReport(userId: string, year: number, month: number): Promise<{
        id: string;
        year: number;
        score: number;
        summary: string;
        leaks: import("@prisma/client/runtime/client").JsonValue;
        wins: import("@prisma/client/runtime/client").JsonValue;
        userId: string;
        month: number;
        scoreReason: string;
        categoryTotals: import("@prisma/client/runtime/client").JsonValue;
        generatedAt: Date;
    }>;
}
