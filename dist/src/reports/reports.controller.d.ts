import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    getReport(user: {
        id: string;
    }, year: number, month: number): Promise<{
        userId: string;
        id: string;
        year: number;
        summary: string;
        score: number;
        leaks: import("@prisma/client/runtime/client").JsonValue;
        wins: import("@prisma/client/runtime/client").JsonValue;
        month: number;
        scoreReason: string;
        categoryTotals: import("@prisma/client/runtime/client").JsonValue;
        generatedAt: Date;
    }>;
    generateReport(user: {
        id: string;
    }, year: number, month: number): Promise<{
        userId: string;
        id: string;
        year: number;
        summary: string;
        score: number;
        leaks: import("@prisma/client/runtime/client").JsonValue;
        wins: import("@prisma/client/runtime/client").JsonValue;
        month: number;
        scoreReason: string;
        categoryTotals: import("@prisma/client/runtime/client").JsonValue;
        generatedAt: Date;
    }>;
}
