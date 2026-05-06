import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { ReportsController } from '../src/reports/reports.controller';
import { ReportsService } from '../src/reports/reports.service';
import { AuthGuard } from '@nestjs/passport';
import { testUsers, testReports } from '../src/__tests__/fixtures/test-data';

describe('Reports E2E', () => {
  let app: INestApplication;
  let reportsService: ReportsService;

  const mockAuthGuard = {
    canActivate: (context: any) => {
      const request = context.switchToHttp().getRequest();
      request.user = { id: 'test-user-id', email: 'test@example.com' };
      return true;
    },
  };

  beforeAll(async () => {
    jest.clearAllMocks();

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
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    reportsService = module.get<ReportsService>(ReportsService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /reports/:year/:month', () => {
    it('should get a monthly report', async () => {
      const year = 2026;
      const month = 5;

      (reportsService.getReport as jest.Mock).mockResolvedValue(
        testReports.current,
      );

      const response = await request(app.getHttpServer())
        .get(`/reports/${year}/${month}`)
        .expect(200);

      expect(response.body).toHaveProperty('score');
      expect(response.body).toHaveProperty('categoryTotals');
      expect(response.body.year).toBe(year);
      expect(response.body.month).toBe(month);
    });

    it('should return 404 for non-existent report', async () => {
      const year = 2026;
      const month = 1;

      (reportsService.getReport as jest.Mock).mockRejectedValue(
        new Error('Not found'),
      );

      await request(app.getHttpServer())
        .get(`/reports/${year}/${month}`)
        .expect(500);
    });

    it('should return 400 for invalid year parameter', async () => {
      await request(app.getHttpServer()).get('/reports/invalid/5').expect(400);
    });

    it('should return 400 for invalid month parameter', async () => {
      await request(app.getHttpServer())
        .get('/reports/2026/invalid')
        .expect(400);
    });
  });

  describe('POST /reports/:year/:month/generate', () => {
    it('should generate a monthly report', async () => {
      const year = 2026;
      const month = 5;

      (reportsService.generateReport as jest.Mock).mockResolvedValue(
        testReports.current,
      );

      const response = await request(app.getHttpServer())
        .post(`/reports/${year}/${month}/generate`)
        .expect(201);

      expect(response.body).toHaveProperty('score');
      expect(response.body).toHaveProperty('summary');
      expect(response.body).toHaveProperty('leaks');
      expect(response.body).toHaveProperty('wins');
    });

    it('should include category totals in generated report', async () => {
      const year = 2026;
      const month = 5;

      (reportsService.generateReport as jest.Mock).mockResolvedValue(
        testReports.current,
      );

      const response = await request(app.getHttpServer())
        .post(`/reports/${year}/${month}/generate`)
        .expect(201);

      expect(response.body.categoryTotals).toBeDefined();
      expect(typeof response.body.categoryTotals).toBe('object');
    });

    it('should return 400 for invalid year parameter', async () => {
      await request(app.getHttpServer())
        .post('/reports/invalid/5/generate')
        .expect(400);
    });

    it('should return 400 for invalid month parameter', async () => {
      await request(app.getHttpServer())
        .post('/reports/2026/invalid/generate')
        .expect(400);
    });
  });
});
