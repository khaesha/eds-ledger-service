import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { NotFoundException } from '@nestjs/common';
import { createMockPrismaService } from '../__tests__/mocks/prisma.mock';
import {
  testUsers,
  testExpenses,
  testReports,
} from '../__tests__/fixtures/test-data';

describe('ReportsService', () => {
  let service: ReportsService;
  let prismaService: ReturnType<typeof createMockPrismaService>;
  let aiService: AiService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockAiService = {
      generateMonthlyReport: jest.fn(),
      categorizeExpenses: jest.fn(),
      chat: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: createMockPrismaService(),
        },
        {
          provide: AiService,
          useValue: mockAiService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prismaService = module.get(PrismaService);
    aiService = module.get<AiService>(AiService);
  });

  describe('getReport', () => {
    it('should retrieve an existing report', async () => {
      const userId = testUsers.standard.id;
      const year = 2026;
      const month = 5;

      prismaService.monthlyReport.findUnique.mockResolvedValue(
        testReports.current,
      );

      const result = await service.getReport(userId, year, month);

      expect(result).toEqual(testReports.current);
      expect(prismaService.monthlyReport.findUnique).toHaveBeenCalledWith({
        where: { userId_year_month: { userId, year, month } },
      });
    });

    it('should throw NotFoundException if report does not exist', async () => {
      const userId = testUsers.standard.id;
      const year = 2026;
      const month = 5;

      prismaService.monthlyReport.findUnique.mockResolvedValue(null);

      await expect(service.getReport(userId, year, month)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should query with correct user_year_month composite key', async () => {
      const userId = testUsers.standard.id;
      const year = 2026;
      const month = 5;

      prismaService.monthlyReport.findUnique.mockResolvedValue(null);

      try {
        await service.getReport(userId, year, month);
      } catch {
        // Expected to throw NotFoundException
      }

      const callArg = (prismaService.monthlyReport.findUnique as jest.Mock).mock
        .calls[0][0];
      expect(callArg.where.userId_year_month).toEqual({
        userId,
        year,
        month,
      });
    });

    it('should prevent user from accessing other users reports (IDOR)', async () => {
      const userAId = testUsers.standard.id;
      const userBId = testUsers.other.id;
      const year = 2026;
      const month = 5;

      prismaService.monthlyReport.findUnique.mockResolvedValue(null);

      try {
        await service.getReport(userAId, year, month);
      } catch {
        // Expected
      }

      const callArg = (prismaService.monthlyReport.findUnique as jest.Mock).mock
        .calls[0][0];
      expect(callArg.where.userId_year_month.userId).toBe(userAId);
    });
  });

  describe('generateReport', () => {
    it('should generate a report for the specified month', async () => {
      const userId = testUsers.standard.id;
      const year = 2026;
      const month = 5;

      prismaService.expense.findMany.mockResolvedValue([
        testExpenses.normal,
        testExpenses.large,
      ]);

      (aiService.generateMonthlyReport as jest.Mock).mockResolvedValue({
        score: 75,
        score_reason: 'Good balance',
        summary: 'Your spending was balanced.',
        leaks: [],
        wins: ['Great job'],
      });

      prismaService.monthlyReport.upsert.mockResolvedValue(testReports.current);

      const result = await service.generateReport(userId, year, month);

      expect(result).toBeDefined();
      expect(prismaService.expense.findMany).toHaveBeenCalled();
      expect(aiService.generateMonthlyReport).toHaveBeenCalled();
    });

    it('should aggregate expenses by category', async () => {
      const userId = testUsers.standard.id;
      const year = 2026;
      const month = 5;

      const expenses = [
        { ...testExpenses.normal, category: 'food', amount: 50000 },
        { ...testExpenses.duplicateCategory, category: 'food', amount: 25000 },
      ];

      prismaService.expense.findMany.mockResolvedValue(expenses);

      (aiService.generateMonthlyReport as jest.Mock).mockResolvedValue({
        score: 75,
        score_reason: 'test',
        summary: 'test',
        leaks: [],
        wins: [],
      });

      prismaService.monthlyReport.upsert.mockResolvedValue({
        ...testReports.current,
        categoryTotals: { food: 75000 },
      });

      const result = await service.generateReport(userId, year, month);

      const upsertCall = (prismaService.monthlyReport.upsert as jest.Mock).mock
        .calls[0][0];
      expect(upsertCall.create.categoryTotals.food).toBe(75000);
    });

    it('should calculate total spent across all categories', async () => {
      const userId = testUsers.standard.id;
      const year = 2026;
      const month = 5;

      const expenses = [
        { ...testExpenses.normal, amount: 50000 },
        { ...testExpenses.large, amount: 100000 },
      ];

      prismaService.expense.findMany.mockResolvedValue(expenses);

      (aiService.generateMonthlyReport as jest.Mock).mockResolvedValue({
        score: 75,
        score_reason: 'test',
        summary: 'test',
        leaks: [],
        wins: [],
      });

      prismaService.monthlyReport.upsert.mockResolvedValue(testReports.current);

      await service.generateReport(userId, year, month);

      const aiCallArg = (aiService.generateMonthlyReport as jest.Mock).mock
        .calls[0];
      expect(aiCallArg[1]).toBe(150000);
    });

    it('should handle AI service failure with fallback report', async () => {
      const userId = testUsers.standard.id;
      const year = 2026;
      const month = 5;

      prismaService.expense.findMany.mockResolvedValue([testExpenses.normal]);

      (aiService.generateMonthlyReport as jest.Mock).mockRejectedValue(
        new Error('API Error'),
      );

      prismaService.monthlyReport.upsert.mockResolvedValue({
        ...testReports.current,
        score: 50,
        scoreReason: 'AI analysis unavailable — default score assigned.',
      });

      const result = await service.generateReport(userId, year, month);

      expect(result).toBeDefined();
      const upsertCall = (prismaService.monthlyReport.upsert as jest.Mock).mock
        .calls[0][0];
      expect(upsertCall.create.score).toBe(50);
    });

    it('should use upsert to create or update report', async () => {
      const userId = testUsers.standard.id;
      const year = 2026;
      const month = 5;

      prismaService.expense.findMany.mockResolvedValue([]);

      (aiService.generateMonthlyReport as jest.Mock).mockResolvedValue({
        score: 50,
        score_reason: 'test',
        summary: 'test',
        leaks: [],
        wins: [],
      });

      prismaService.monthlyReport.upsert.mockResolvedValue(testReports.current);

      await service.generateReport(userId, year, month);

      expect(prismaService.monthlyReport.upsert).toHaveBeenCalled();
    });

    it('should query expenses within the correct month range', async () => {
      const userId = testUsers.standard.id;
      const year = 2026;
      const month = 5;

      prismaService.expense.findMany.mockResolvedValue([]);

      (aiService.generateMonthlyReport as jest.Mock).mockResolvedValue({
        score: 50,
        score_reason: 'test',
        summary: 'test',
        leaks: [],
        wins: [],
      });

      prismaService.monthlyReport.upsert.mockResolvedValue(testReports.current);

      await service.generateReport(userId, year, month);

      const expenseCallArg = (prismaService.expense.findMany as jest.Mock).mock
        .calls[0][0];
      expect(expenseCallArg.where.userId).toBe(userId);
      expect(expenseCallArg.where.date.gte).toEqual(new Date(2026, 4, 1));
      expect(expenseCallArg.where.date.lt).toEqual(new Date(2026, 5, 1));
    });
  });
});
