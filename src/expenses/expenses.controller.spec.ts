import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { testUsers, testExpenses, testDtos } from '../__tests__/fixtures/test-data';

describe('ExpensesController', () => {
  let controller: ExpensesController;
  let expensesService: ExpensesService;

  beforeEach(async () => {
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
    }).compile();

    controller = module.get<ExpensesController>(ExpensesController);
    expensesService = module.get<ExpensesService>(ExpensesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should call expensesService.findAll with user ID', async () => {
      const user = { id: testUsers.standard.id };

      (expensesService.findAll as jest.Mock).mockResolvedValue([
        testExpenses.normal,
      ]);

      await controller.findAll(user);

      expect(expensesService.findAll).toHaveBeenCalledWith(user.id);
    });

    it('should return all expenses for the user', async () => {
      const user = { id: testUsers.standard.id };
      const expenses = [testExpenses.normal, testExpenses.large];

      (expensesService.findAll as jest.Mock).mockResolvedValue(expenses);

      const result = await controller.findAll(user);

      expect(result).toEqual(expenses);
    });

    it('should handle user isolation - only call service with user ID', async () => {
      const user = { id: testUsers.standard.id };

      (expensesService.findAll as jest.Mock).mockResolvedValue([]);

      await controller.findAll(user);

      const callArg = (expensesService.findAll as jest.Mock).mock.calls[0][0];
      expect(callArg).toBe(testUsers.standard.id);
    });
  });

  describe('create', () => {
    it('should call expensesService.create with user ID and DTO', async () => {
      const user = { id: testUsers.standard.id };
      const dto = testDtos.validExpense;

      (expensesService.create as jest.Mock).mockResolvedValue(
        testExpenses.normal,
      );

      await controller.create(user, dto);

      expect(expensesService.create).toHaveBeenCalledWith(user.id, dto);
    });

    it('should return created expense', async () => {
      const user = { id: testUsers.standard.id };
      const dto = testDtos.validExpense;

      (expensesService.create as jest.Mock).mockResolvedValue(
        testExpenses.normal,
      );

      const result = await controller.create(user, dto);

      expect(result).toEqual(testExpenses.normal);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('category');
    });
  });

  describe('remove', () => {
    it('should call expensesService.remove with user ID and expense ID', async () => {
      const user = { id: testUsers.standard.id };
      const expenseId = testExpenses.normal.id;

      (expensesService.remove as jest.Mock).mockResolvedValue(
        testExpenses.normal,
      );

      await controller.remove(user, expenseId);

      expect(expensesService.remove).toHaveBeenCalledWith(user.id, expenseId);
    });

    it('should return deleted expense', async () => {
      const user = { id: testUsers.standard.id };
      const expenseId = testExpenses.normal.id;

      (expensesService.remove as jest.Mock).mockResolvedValue(
        testExpenses.normal,
      );

      const result = await controller.remove(user, expenseId);

      expect(result).toEqual(testExpenses.normal);
    });

    it('should prevent user from deleting other users expenses', async () => {
      const user = { id: testUsers.standard.id };
      const expenseId = testExpenses.normal.id;

      (expensesService.remove as jest.Mock).mockResolvedValue(
        testExpenses.normal,
      );

      await controller.remove(user, expenseId);

      const callArgs = (expensesService.remove as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toBe(user.id);
    });
  });

  describe('importCsv', () => {
    it('should call expensesService.importCsv with user ID and file path', async () => {
      const user = { id: testUsers.standard.id };
      const mockFile = {
        path: '/tmp/expenses.csv',
        mimetype: 'text/csv',
        originalname: 'expenses.csv',
      } as Express.Multer.File;

      (expensesService.importCsv as jest.Mock).mockResolvedValue({
        imported: 5,
      });

      await controller.importCsv(user, mockFile);

      expect(expensesService.importCsv).toHaveBeenCalledWith(user.id, mockFile.path);
    });

    it('should return import result', async () => {
      const user = { id: testUsers.standard.id };
      const mockFile = {
        path: '/tmp/expenses.csv',
      } as Express.Multer.File;

      (expensesService.importCsv as jest.Mock).mockResolvedValue({
        imported: 10,
      });

      const result = await controller.importCsv(user, mockFile);

      expect(result).toHaveProperty('imported', 10);
    });
  });
});
