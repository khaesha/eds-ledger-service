import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async getReport(userId: string, year: number, month: number) {
    const report = await this.prisma.monthlyReport.findUnique({
      where: { userId_year_month: { userId, year, month } },
    });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async generateReport(userId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const expenses = await this.prisma.expense.findMany({
      where: { userId, date: { gte: start, lt: end } },
    });

    const categoryTotals: Record<string, number> = {};
    let totalSpent = 0;
    for (const exp of expenses) {
      categoryTotals[exp.category] =
        (categoryTotals[exp.category] ?? 0) + exp.amount;
      totalSpent += exp.amount;
    }

    let result: import('../ai/ai.service').ReportResult;
    try {
      result = await this.ai.generateMonthlyReport(categoryTotals, totalSpent);
    } catch {
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
}
