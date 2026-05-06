"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
let ReportsService = class ReportsService {
    prisma;
    ai;
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
    }
    async getReport(userId, year, month) {
        const report = await this.prisma.monthlyReport.findUnique({
            where: { userId_year_month: { userId, year, month } },
        });
        if (!report)
            throw new common_1.NotFoundException('Report not found');
        return report;
    }
    async generateReport(userId, year, month) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);
        const expenses = await this.prisma.expense.findMany({
            where: { userId, date: { gte: start, lt: end } },
        });
        const categoryTotals = {};
        let totalSpent = 0;
        for (const exp of expenses) {
            categoryTotals[exp.category] =
                (categoryTotals[exp.category] ?? 0) + exp.amount;
            totalSpent += exp.amount;
        }
        let result;
        try {
            result = await this.ai.generateMonthlyReport(categoryTotals, totalSpent);
        }
        catch {
            result = {
                score: 50,
                score_reason: 'AI analysis unavailable — default score assigned.',
                summary: 'Ed could not analyze this month. Check your AI API key.',
                leaks: [],
                wins: [],
            };
        }
        return this.prisma.monthlyReport.upsert({
            where: { userId_year_month: { userId, year, month } },
            create: {
                userId,
                year,
                month,
                score: result.score ?? 0,
                scoreReason: result.score_reason ?? '',
                summary: result.summary ?? '',
                leaks: result.leaks ?? [],
                wins: result.wins ?? [],
                categoryTotals,
            },
            update: {
                score: result.score ?? 0,
                scoreReason: result.score_reason ?? '',
                summary: result.summary ?? '',
                leaks: result.leaks ?? [],
                wins: result.wins ?? [],
                categoryTotals,
                generatedAt: new Date(),
            },
        });
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map