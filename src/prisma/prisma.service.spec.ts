import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await service?.$disconnect?.();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should implement OnModuleInit', () => {
    expect(service.onModuleInit).toBeDefined();
    expect(typeof service.onModuleInit).toBe('function');
  });

  it('should implement OnModuleDestroy', () => {
    expect(service.onModuleDestroy).toBeDefined();
    expect(typeof service.onModuleDestroy).toBe('function');
  });

  it('should have access to Prisma models', () => {
    expect(service.user).toBeDefined();
    expect(service.expense).toBeDefined();
    expect(service.monthlyReport).toBeDefined();
  });

  it('should have user model methods', () => {
    expect(service.user.findUnique).toBeDefined();
    expect(service.user.findMany).toBeDefined();
    expect(service.user.create).toBeDefined();
  });

  it('should have expense model methods', () => {
    expect(service.expense.findMany).toBeDefined();
    expect(service.expense.create).toBeDefined();
    expect(service.expense.delete).toBeDefined();
    expect(service.expense.findUnique).toBeDefined();
  });

  it('should have monthlyReport model methods', () => {
    expect(service.monthlyReport.findUnique).toBeDefined();
    expect(service.monthlyReport.upsert).toBeDefined();
    expect(service.monthlyReport.create).toBeDefined();
  });
});
