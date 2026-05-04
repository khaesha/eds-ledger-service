import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { createMockConfigService } from '../__tests__/mocks/config.mock';

describe('AiService', () => {
  let service: any;
  let configService: ConfigService;
  let mockOpenAiCreate: jest.Mock;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Create a fresh mock for each test
    mockOpenAiCreate = jest.fn();
    const mockOpenAiClient = {
      chat: {
        completions: {
          create: mockOpenAiCreate,
        },
      },
    };

    // Mock OpenAI constructor
    const OpenAIModule = require('openai');
    jest.spyOn(OpenAIModule, 'default').mockImplementation(() => mockOpenAiClient);

    // Import AiService
    const { AiService } = require('./ai.service');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
      ],
    }).compile();

    service = module.get<any>(AiService);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('categorizeExpenses', () => {
    it('should categorize expenses successfully', async () => {
      const expenses = [
        { description: 'Coffee at Starbucks', amount: 50000 },
        { description: 'Gas', amount: 100000 },
      ];

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify([
                { description: 'Coffee at Starbucks', category: 'food', ai_note: 'Morning coffee' },
                { description: 'Gas', category: 'transport', ai_note: 'Fuel' },
              ]),
            },
          },
        ],
      };

      mockOpenAiCreate.mockResolvedValue(mockResponse);

      const result = await service.categorizeExpenses(expenses);

      expect(result).toHaveLength(2);
      expect(result[0].category).toBe('food');
      expect(result[1].category).toBe('transport');
    });

    it('should return empty array on parse failure', async () => {
      const expenses = [{ description: 'Test', amount: 1000 }];

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'invalid json',
            },
          },
        ],
      };

      mockOpenAiCreate.mockResolvedValue(mockResponse);

      const result = await service.categorizeExpenses(expenses);

      expect(result).toEqual([]);
    });

    it('should handle API timeout gracefully', async () => {
      const expenses = [{ description: 'Test', amount: 1000 }];

      mockOpenAiCreate.mockRejectedValue(
        new Error('API timeout'),
      );

      await expect(service.categorizeExpenses(expenses)).rejects.toThrow();
    });

    it('should normalize invalid categories to "other"', async () => {
      const expenses = [{ description: 'Test', amount: 1000 }];

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify([
                { description: 'Test', category: 'invalid_category', ai_note: 'note' },
              ]),
            },
          },
        ],
      };

      mockOpenAiCreate.mockResolvedValue(mockResponse);

      const result = await service.categorizeExpenses(expenses);

      expect(result[0].category).toBe('other');
    });

    it('should handle markdown-wrapped JSON responses', async () => {
      const expenses = [{ description: 'Test', amount: 1000 }];

      const mockResponse = {
        choices: [
          {
            message: {
              content: '```json\n[{"description":"Test","category":"food","ai_note":"note"}]\n```',
            },
          },
        ],
      };

      mockOpenAiCreate.mockResolvedValue(mockResponse);

      const result = await service.categorizeExpenses(expenses);

      expect(result).toHaveLength(1);
      expect(result[0].category).toBe('food');
    });
  });

  describe('generateMonthlyReport', () => {
    it('should generate a monthly report successfully', async () => {
      const categoryTotals = {
        food: 500000,
        transport: 200000,
        entertainment: 100000,
      };
      const totalSpent = 800000;

      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                score: 78,
                score_reason: 'Good spending habits',
                summary: 'Your spending was balanced',
                leaks: [{ name: 'Entertainment', amount: 100000, tip: 'Reduce spending' }],
                wins: ['Good food budget'],
              }),
            },
          },
        ],
      };

      mockOpenAiCreate.mockResolvedValue(mockResponse);

      const result = await service.generateMonthlyReport(categoryTotals, totalSpent);

      expect(result.score).toBe(78);
      expect(result.score_reason).toBe('Good spending habits');
      expect(result.leaks).toHaveLength(1);
    });

    it('should clamp score between 0-100', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                score: 150,
                score_reason: 'Over 100',
                summary: 'test',
                leaks: [],
                wins: [],
              }),
            },
          },
        ],
      };

      mockOpenAiCreate.mockResolvedValue(mockResponse);

      const result = await service.generateMonthlyReport({}, 0);

      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it('should default to score 50 on invalid score', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                score: 'invalid',
                score_reason: 'test',
                summary: 'test',
                leaks: [],
                wins: [],
              }),
            },
          },
        ],
      };

      mockOpenAiCreate.mockResolvedValue(mockResponse);

      const result = await service.generateMonthlyReport({}, 0);

      expect(result.score).toBe(50);
    });

    it('should handle missing leaks and wins as empty arrays', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                score: 75,
                score_reason: 'test',
                summary: 'test',
              }),
            },
          },
        ],
      };

      mockOpenAiCreate.mockResolvedValue(mockResponse);

      const result = await service.generateMonthlyReport({}, 0);

      expect(result.leaks).toEqual([]);
      expect(result.wins).toEqual([]);
    });
  });

  describe('chat', () => {
    it('should generate a chat response', async () => {
      const userMessage = 'How am I doing?';
      const categoryTotals = { food: 500000 };

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Your food spending looks great!',
            },
          },
        ],
      };

      mockOpenAiCreate.mockResolvedValue(mockResponse);

      const result = await service.chat(userMessage, categoryTotals);

      expect(result).toBe('Your food spending looks great!');
    });

    it('should return empty string on API error', async () => {
      const userMessage = 'Test';
      const categoryTotals = {};

      const mockResponse = {
        choices: [
          {
            message: {
              content: undefined,
            },
          },
        ],
      };

      mockOpenAiCreate.mockResolvedValue(mockResponse);

      const result = await service.chat(userMessage, categoryTotals);

      expect(result).toBe('');
    });

    it('should handle API errors gracefully', async () => {
      const userMessage = 'Test';
      const categoryTotals = {};

      mockOpenAiCreate.mockRejectedValue(
        new Error('API error'),
      );

      await expect(service.chat(userMessage, categoryTotals)).rejects.toThrow();
    });
  });

  describe('configuration', () => {
    it('should use OPENROUTER_API_KEY from config', () => {
      expect(configService.get).toHaveBeenCalledWith('OPENROUTER_API_KEY');
    });
  });
});
