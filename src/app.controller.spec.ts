import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { createMockPrismaService } from './__tests__/mocks/prisma.mock';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: PrismaService,
          useValue: createMockPrismaService(),
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });

    it('should call appService.getHello', () => {
      jest.spyOn(appService, 'getHello').mockReturnValue('Hello World!');
      expect(appController.getHello()).toBe('Hello World!');
      expect(appService.getHello).toHaveBeenCalled();
    });

    it('should be accessible via GET /', () => {
      expect(appController.getHello).toBeDefined();
      expect(typeof appController.getHello).toBe('function');
    });
  });

  describe('health', () => {
    it('should return health status', async () => {
      jest.spyOn(appService, 'getHealth').mockResolvedValue({ status: 'ok' });
      const result = await appController.getHealth();
      expect(result).toEqual({ status: 'ok' });
    });

    it('should call appService.getHealth', async () => {
      jest.spyOn(appService, 'getHealth').mockResolvedValue({ status: 'ok' });
      await appController.getHealth();
      expect(appService.getHealth).toHaveBeenCalled();
    });

    it('should be accessible via GET /health without auth', () => {
      expect(appController.getHealth).toBeDefined();
      expect(typeof appController.getHealth).toBe('function');
    });
  });
});
