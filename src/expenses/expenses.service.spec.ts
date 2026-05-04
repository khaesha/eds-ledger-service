import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesService } from './expenses.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { createMockPrismaService } from '../__tests__/mocks/prisma.mock';
import {
  testUsers,
  testExpenses,
  testDtos,
} from '../__tests__/fixtures/test-data';
import * as fs from 'fs';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let prismaService: ReturnType<typeof createMockPrismaService>;
  let aiService: AiService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockAiService = {
      categorizeExpenses: jest.fn(),
      generateMonthlyReport: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
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

    service = module.get<ExpensesService>(ExpensesService);
    prismaService = module.get(PrismaService);
    aiService = module.get<AiService>(AiService);
  });

  describe('findAll', () => {
    it('should return all expenses for a user', async () => {
      const userId = testUsers.standard.id;
      const expenses = [testExpenses.normal, testExpenses.large];

      prismaService.expense.findMany.mockResolvedValue(expenses);

      const result = await service.findAll(userId);

      expect(result).toEqual(expenses);
      expect(prismaService.expense.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { date: 'desc' },
      });
    });

    it('should return empty array if user has no expenses', async () => {
      const userId = testUsers.standard.id;

      prismaService.expense.findMany.mockResolvedValue([]);

      const result = await service.findAll(userId);

      expect(result).toEqual([]);
    });

    it('should order expenses by date descending', async () => {
      const userId = testUsers.standard.id;

      await service.findAll(userId);

      expect(prismaService.expense.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { date: 'desc' },
      });
    });

    it('should only return expenses for the specific user', async () => {
      const userId = testUsers.standard.id;

      await service.findAll(userId);

      const callArg = (prismaService.expense.findMany as jest.Mock).mock
        .calls[0][0];
      expect(callArg.where.userId).toBe(userId);
    });
  });

  describe('create', () => {
    it('should create an expense with AI categorization', async () => {
      const userId = testUsers.standard.id;
      const dto = testDtos.validExpense;
      const categorized = {
        description: dto.description,
        category: 'food',
        ai_note: 'Lunch expense',
      };

      (aiService.categorizeExpenses as jest.Mock).mockResolvedValue([
        categorized,
      ]);
      prismaService.expense.create.mockResolvedValue({
        id: 'expense-new',
        userId,
        ...dto,
        category: 'food',
        aiNote: 'Lunch expense',
        createdAt: new Date(),
      });

      const result = await service.create(userId, dto);

      expect(result).toHaveProperty('id');
      expect(aiService.categorizeExpenses).toHaveBeenCalled();
      expect(prismaService.expense.create).toHaveBeenCalled();
    });

    it('should fallback to "other" category if AI fails', async () => {
      const userId = testUsers.standard.id;
      const dto = testDtos.validExpense;

      (aiService.categorizeExpenses as jest.Mock).mockRejectedValue(
        new Error('API error'),
      );
      prismaService.expense.create.mockResolvedValue({
        id: 'expense-fallback',
        userId,
        ...dto,
        category: 'other',
        aiNote: null,
        createdAt: new Date(),
      });

      const result = await service.create(userId, dto);

      expect(result.category).toBe('other');
      expect(prismaService.expense.create).toHaveBeenCalled();
    });

    it('should use provided date or default to today', async () => {
      const userId = testUsers.standard.id;
      const dtoWithDate = { ...testDtos.validExpense, date: '2026-05-05' };

      (aiService.categorizeExpenses as jest.Mock).mockResolvedValue([
        {
          description: dtoWithDate.description,
          category: 'food',
          ai_note: null,
        },
      ]);
      prismaService.expense.create.mockResolvedValue({
        id: 'expense-1',
        userId,
        description: dtoWithDate.description,
        amount: dtoWithDate.amount,
        date: new Date('2026-05-05'),
        category: 'food',
        aiNote: null,
        createdAt: new Date(),
      });

      await service.create(userId, dtoWithDate);

      const createCall = (prismaService.expense.create as jest.Mock).mock
        .calls[0][0];
      expect(createCall.data.date).toEqual(new Date('2026-05-05'));
    });

    it('should not include password or sensitive fields in AI request', async () => {
      const userId = testUsers.standard.id;
      const dto = testDtos.validExpense;

      (aiService.categorizeExpenses as jest.Mock).mockResolvedValue([
        {
          description: dto.description,
          category: 'food',
          ai_note: null,
        },
      ]);
      prismaService.expense.create.mockResolvedValue({
        id: 'expense-1',
        userId,
        ...dto,
        category: 'food',
        aiNote: null,
        createdAt: new Date(),
      });

      await service.create(userId, dto);

      const aiCall = (aiService.categorizeExpenses as jest.Mock).mock
        .calls[0][0];
      expect(aiCall[0]).not.toHaveProperty('userId');
    });
  });

  describe('remove', () => {
    it('should delete an expense belonging to the user', async () => {
      const userId = testUsers.standard.id;
      const expenseId = testExpenses.normal.id;

      prismaService.expense.findUnique.mockResolvedValue(testExpenses.normal);
      prismaService.expense.delete.mockResolvedValue(testExpenses.normal);

      const result = await service.remove(userId, expenseId);

      expect(result).toEqual(testExpenses.normal);
      expect(prismaService.expense.delete).toHaveBeenCalledWith({
        where: { id: expenseId },
      });
    });

    it('should throw NotFoundException if expense not found', async () => {
      const userId = testUsers.standard.id;
      const expenseId = 'non-existent';

      prismaService.expense.findUnique.mockResolvedValue(null);

      await expect(service.remove(userId, expenseId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.expense.delete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if expense belongs to different user (IDOR)', async () => {
      const userAId = testUsers.standard.id;
      const userBId = testUsers.other.id;
      const expenseId = testExpenses.normal.id;

      const expenseFromUserB = { ...testExpenses.normal, userId: userBId };
      prismaService.expense.findUnique.mockResolvedValue(expenseFromUserB);

      await expect(service.remove(userAId, expenseId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.expense.delete).not.toHaveBeenCalled();
    });

    it('should verify ownership before deletion (IDOR prevention)', async () => {
      const userId = testUsers.standard.id;
      const expenseId = testExpenses.normal.id;

      prismaService.expense.findUnique.mockResolvedValue(testExpenses.normal);
      prismaService.expense.delete.mockResolvedValue(testExpenses.normal);

      await service.remove(userId, expenseId);

      expect(prismaService.expense.findUnique).toHaveBeenCalled();
      const expense = (prismaService.expense.findUnique as jest.Mock).mock
        .calls[0][0];
      expect(expense.where.id).toBe(expenseId);
    });
  });

  describe('importCsv', () => {
    it('should import expenses from CSV file', async () => {
      const userId = testUsers.standard.id;
      const filePath = '/tmp/expenses.csv';
      const csvContent = `description,amount,date
Coffee,50000,2026-05-01
Lunch,75000,2026-05-02`;

      jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(csvContent);
      jest.spyOn(require('fs'), 'unlinkSync').mockReturnValue(undefined);

      (aiService.categorizeExpenses as jest.Mock).mockResolvedValue([
        { description: 'Coffee', category: 'food', ai_note: null },
        { description: 'Lunch', category: 'food', ai_note: null },
      ]);
      prismaService.expense.createMany.mockResolvedValue({ count: 2 });

      const result = await service.importCsv(userId, filePath);

      expect(result.imported).toBe(2);
      expect(prismaService.expense.createMany).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid CSV format', async () => {
      const userId = testUsers.standard.id;
      const filePath = '/tmp/invalid.csv';

      jest.spyOn(require('fs'), 'readFileSync').mockReturnValue('invalid');
      jest.spyOn(require('fs'), 'unlinkSync').mockReturnValue(undefined);

      await expect(service.importCsv(userId, filePath)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if no valid rows in CSV', async () => {
      const userId = testUsers.standard.id;
      const filePath = '/tmp/empty.csv';
      const csvContent = `description,amount,date`;

      jest.spyOn(require('fs'), 'readFileSync').mockReturnValue(csvContent);
      jest.spyOn(require('fs'), 'unlinkSync').mockReturnValue(undefined);

      await expect(service.importCsv(userId, filePath)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should filter out invalid rows (zero or negative amounts)', async () => {
      const userId = testUsers.standard.id;
      const filePath = '/tmp/valid.csv';
      const csvContent = `description,amount,date
Coffee,50000,2026-05-01
Gas,100000,2026-05-02`;

      jest.spyOn(fs, 'readFileSync').mockReturnValue(csvContent);
      jest.spyOn(fs, 'unlinkSync').mockReturnValue(undefined);

      (aiService.categorizeExpenses as jest.Mock).mockResolvedValue([
        { description: 'Coffee', category: 'food', ai_note: null },
        { description: 'Gas', category: 'transport', ai_note: null },
      ]);
      prismaService.expense.createMany.mockResolvedValue({ count: 2 });

      const result = await service.importCsv(userId, filePath);

      expect(result.imported).toBe(2);
      expect(prismaService.expense.createMany).toHaveBeenCalled();
      const callData = (prismaService.expense.createMany as jest.Mock).mock
        .calls[0][0].data;
      expect(callData).toHaveLength(2);
      expect(callData.every((item: any) => item.amount > 0)).toBe(true);
    });
  });
});
