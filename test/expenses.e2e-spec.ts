import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ExpensesController } from '../src/expenses/expenses.controller';
import { ExpensesService } from '../src/expenses/expenses.service';
import { AuthGuard } from '@nestjs/passport';
import { createMockPrismaService } from '../src/__tests__/mocks/prisma.mock';
import {
  testUsers,
  testExpenses,
  testDtos,
} from '../src/__tests__/fixtures/test-data';

describe('Expenses E2E', () => {
  let app: INestApplication;
  let expensesService: ExpensesService;

  const mockAuthGuard = {
    canActivate: () => true,
  };

  beforeAll(async () => {
    jest.clearAllMocks();

    const mockExpensesService = {
      findAll: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
      importCsv: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpensesController],
      providers: [
        {
          provide: ExpensesService,
          useValue: mockExpensesService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    expensesService = module.get<ExpensesService>(ExpensesService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /expenses', () => {
    it('should return all expenses for user', async () => {
      const expenses = [testExpenses.normal, testExpenses.large];

      (expensesService.findAll as jest.Mock).mockResolvedValue(expenses);

      const response = await request(app.getHttpServer())
        .get('/expenses')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when user has no expenses', async () => {
      (expensesService.findAll as jest.Mock).mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/expenses')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('POST /expenses', () => {
    it('should create a new expense', async () => {
      const dto = testDtos.validExpense;

      (expensesService.create as jest.Mock).mockResolvedValue({
        id: 'expense-new',
        userId: testUsers.standard.id,
        ...dto,
        category: 'food',
        aiNote: null,
        createdAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .post('/expenses')
        .send(dto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('category');
    });

    it('should return 400 for invalid expense data', async () => {
      const dto = testDtos.invalidExpense;

      await request(app.getHttpServer())
        .post('/expenses')
        .send(dto)
        .expect(400);
    });

    it('should accept optional date field', async () => {
      const dto = { ...testDtos.validExpense, date: '2026-05-05' };

      (expensesService.create as jest.Mock).mockResolvedValue({
        id: 'expense-new',
        ...dto,
        category: 'food',
        createdAt: new Date(),
      });

      const response = await request(app.getHttpServer())
        .post('/expenses')
        .send(dto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
    });
  });

  describe('DELETE /expenses/:id', () => {
    it('should delete an expense', async () => {
      const expenseId = testExpenses.normal.id;

      (expensesService.remove as jest.Mock).mockResolvedValue(
        testExpenses.normal,
      );

      const response = await request(app.getHttpServer())
        .delete(`/expenses/${expenseId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', expenseId);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .delete('/expenses/invalid-id')
        .expect(400);
    });

    it('should return 404 for non-existent expense', async () => {
      const expenseId = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

      (expensesService.remove as jest.Mock).mockRejectedValue(
        new Error('Not found'),
      );

      await request(app.getHttpServer())
        .delete(`/expenses/${expenseId}`)
        .expect(500);
    });
  });

  describe('POST /expenses/csv', () => {
    it('should import CSV file', async () => {
      (expensesService.importCsv as jest.Mock).mockResolvedValue({
        imported: 5,
      });

      const response = await request(app.getHttpServer())
        .post('/expenses/csv')
        .attach(
          'file',
          Buffer.from('description,amount\nTest,100'),
          'expenses.csv',
        )
        .expect(201);

      expect(response.body).toHaveProperty('imported');
    });
  });
});
