import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { testUsers, testReports } from '../__tests__/fixtures/test-data';

describe('ReportsController', () => {
  let controller: ReportsController;
  let reportsService: ReportsService;

  beforeEach(async () => {
    const mockReportsService = {
      getReport: jest.fn(),
      generateReport: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: mockReportsService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    reportsService = module.get<ReportsService>(ReportsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getReport', () => {
    it('should call reportsService.getReport with user ID, year, and month', async () => {
      const user = { id: testUsers.standard.id };
      const year = 2026;
      const month = 5;

      (reportsService.getReport as jest.Mock).mockResolvedValue(
        testReports.current,
      );

      await controller.getReport(user, year, month);

      expect(reportsService.getReport).toHaveBeenCalledWith(
        user.id,
        year,
        month,
      );
    });

    it('should return the report', async () => {
      const user = { id: testUsers.standard.id };
      const year = 2026;
      const month = 5;

      (reportsService.getReport as jest.Mock).mockResolvedValue(
        testReports.current,
      );

      const result = await controller.getReport(user, year, month);

      expect(result).toEqual(testReports.current);
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('categoryTotals');
    });

    it('should prevent user from accessing other users reports', async () => {
      const user = { id: testUsers.standard.id };
      const year = 2026;
      const month = 5;

      (reportsService.getReport as jest.Mock).mockResolvedValue(
        testReports.current,
      );

      await controller.getReport(user, year, month);

      const callArgs = (reportsService.getReport as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toBe(user.id);
    });
  });

  describe('generateReport', () => {
    it('should call reportsService.generateReport with user ID, year, and month', async () => {
      const user = { id: testUsers.standard.id };
      const year = 2026;
      const month = 5;

      (reportsService.generateReport as jest.Mock).mockResolvedValue(
        testReports.current,
      );

      await controller.generateReport(user, year, month);

      expect(reportsService.generateReport).toHaveBeenCalledWith(
        user.id,
        year,
        month,
      );
    });

    it('should return the generated report', async () => {
      const user = { id: testUsers.standard.id };
      const year = 2026;
      const month = 5;

      (reportsService.generateReport as jest.Mock).mockResolvedValue(
        testReports.current,
      );

      const result = await controller.generateReport(user, year, month);

      expect(result).toEqual(testReports.current);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('score');
    });

    it('should use user ID from CurrentUser decorator', async () => {
      const user = { id: testUsers.standard.id };
      const year = 2026;
      const month = 5;

      (reportsService.generateReport as jest.Mock).mockResolvedValue(
        testReports.current,
      );

      await controller.generateReport(user, year, month);

      const callArgs = (reportsService.generateReport as jest.Mock).mock
        .calls[0];
      expect(callArgs[0]).toBe(user.id);
    });
  });
});
