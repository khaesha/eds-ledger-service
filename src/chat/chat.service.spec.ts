import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { createMockPrismaService } from '../__tests__/mocks/prisma.mock';
import { testUsers, testExpenses } from '../__tests__/fixtures/test-data';

describe('ChatService', () => {
  let service: ChatService;
  let prismaService: ReturnType<typeof createMockPrismaService>;
  let aiService: AiService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockAiService = {
      chat: jest.fn(),
      categorizeExpenses: jest.fn(),
      generateMonthlyReport: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
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

    service = module.get<ChatService>(ChatService);
    prismaService = module.get(PrismaService) as any;
    aiService = module.get<AiService>(AiService);
  });

  describe('ask', () => {
    it('should generate a chat response based on current month expenses', async () => {
      const userId = testUsers.standard.id;
      const message = 'How am I doing?';

      prismaService.expense.findMany.mockResolvedValue([testExpenses.normal]);

      (aiService.chat as jest.Mock).mockResolvedValue(
        'Your food spending looks good!',
      );

      const result = await service.ask(userId, message);

      expect(result).toHaveProperty('reply');
      expect(result.reply).toBe('Your food spending looks good!');
    });

    it('should aggregate current month expenses by category', async () => {
      const userId = testUsers.standard.id;
      const message = 'Test message';
      const expenses = [
        { ...testExpenses.normal, category: 'food', amount: 50000 },
        { ...testExpenses.duplicateCategory, category: 'food', amount: 25000 },
      ];

      prismaService.expense.findMany.mockResolvedValue(expenses);

      (aiService.chat as jest.Mock).mockResolvedValue('Response');

      await service.ask(userId, message);

      const aiCall = (aiService.chat as jest.Mock).mock.calls[0];
      expect(aiCall[1].food).toBe(75000);
    });

    it('should query expenses from current month only', async () => {
      const userId = testUsers.standard.id;
      const message = 'Test';

      prismaService.expense.findMany.mockResolvedValue([]);

      (aiService.chat as jest.Mock).mockResolvedValue('Response');

      await service.ask(userId, message);

      const prismaCall = (prismaService.expense.findMany as jest.Mock).mock
        .calls[0][0];
      expect(prismaCall.where.userId).toBe(userId);
      // Should query current month
      const now = new Date();
      const expectedStart = new Date(now.getFullYear(), now.getMonth(), 1);
      expect(prismaCall.where.date.gte).toEqual(expectedStart);
    });

    it('should pass user message to AI service', async () => {
      const userId = testUsers.standard.id;
      const message = 'How much did I spend on food?';

      prismaService.expense.findMany.mockResolvedValue([]);

      (aiService.chat as jest.Mock).mockResolvedValue('Response');

      await service.ask(userId, message);

      const aiCall = (aiService.chat as jest.Mock).mock.calls[0];
      expect(aiCall[0]).toBe(message);
    });

    it('should return empty categoryTotals if user has no current month expenses', async () => {
      const userId = testUsers.standard.id;
      const message = 'Test';

      prismaService.expense.findMany.mockResolvedValue([]);

      (aiService.chat as jest.Mock).mockResolvedValue('No expenses this month');

      const result = await service.ask(userId, message);

      const aiCall = (aiService.chat as jest.Mock).mock.calls[0];
      expect(aiCall[1]).toEqual({});
      expect(result.reply).toBe('No expenses this month');
    });

    it('should handle multiple categories in current month', async () => {
      const userId = testUsers.standard.id;
      const message = 'Analyze my spending';
      const expenses = [
        { ...testExpenses.normal, category: 'food', amount: 50000 },
        { ...testExpenses.large, category: 'utilities', amount: 100000 },
      ];

      prismaService.expense.findMany.mockResolvedValue(expenses);

      (aiService.chat as jest.Mock).mockResolvedValue('Response');

      await service.ask(userId, message);

      const aiCall = (aiService.chat as jest.Mock).mock.calls[0];
      expect(aiCall[1]).toEqual({
        food: 50000,
        utilities: 100000,
      });
    });

    it('should only include current user expenses in categoryTotals', async () => {
      const userId = testUsers.standard.id;
      const message = 'Test';

      prismaService.expense.findMany.mockResolvedValue([testExpenses.normal]);

      (aiService.chat as jest.Mock).mockResolvedValue('Response');

      await service.ask(userId, message);

      const prismaCall = (prismaService.expense.findMany as jest.Mock).mock
        .calls[0][0];
      expect(prismaCall.where.userId).toBe(userId);
    });
  });
});
