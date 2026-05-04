export type MockPrismaService = any;

export const createMockPrismaService = (): MockPrismaService => {
  return {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    expense: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    monthlyReport: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  };
};

export const createMockPrismaUser = () => ({
  id: 'user-1',
  email: 'test@example.com',
  password: '$2b$12$hashedpassword123',
  name: 'Test User',
  createdAt: new Date('2026-01-01'),
});

export const createMockPrismaExpense = (overrides = {}) => ({
  id: 'expense-1',
  userId: 'user-1',
  description: 'Coffee at Starbucks',
  amount: 50000,
  category: 'food',
  aiNote: 'Morning caffeine boost',
  date: new Date('2026-05-01'),
  createdAt: new Date('2026-05-01'),
  ...overrides,
});

export const createMockPrismaMonthlyReport = (overrides = {}) => ({
  id: 'report-1',
  userId: 'user-1',
  year: 2026,
  month: 5,
  score: 78,
  scoreReason: 'Good spending habits with moderate entertainment expenses',
  summary: 'Your spending was well-balanced this month.',
  leaks: [
    {
      name: 'Subscriptions',
      amount: 150000,
      tip: 'Consider canceling unused services.',
    },
  ],
  wins: ['Reduced transport costs by 20%'],
  categoryTotals: {
    food: 500000,
    transport: 200000,
    entertainment: 100000,
    other: 150000,
  },
  generatedAt: new Date('2026-05-01T12:00:00Z'),
  ...overrides,
});
