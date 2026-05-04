export const testUsers = {
  standard: {
    id: 'user-1',
    email: 'user@example.com',
    password: 'Test@1234',
    passwordHash: '$2b$12$hashedTest@1234',
    name: 'John Doe',
    createdAt: new Date('2026-01-01'),
  },
  admin: {
    id: 'user-2',
    email: 'admin@example.com',
    password: 'Admin@1234',
    passwordHash: '$2b$12$hashedAdmin@1234',
    name: 'Admin User',
    createdAt: new Date('2026-01-01'),
  },
  other: {
    id: 'user-3',
    email: 'other@example.com',
    password: 'Other@1234',
    passwordHash: '$2b$12$hashedOther@1234',
    name: 'Other User',
    createdAt: new Date('2026-02-01'),
  },
};

export const testExpenses = {
  normal: {
    id: 'expense-1',
    userId: 'user-1',
    description: 'Coffee at Starbucks',
    amount: 50000,
    category: 'food',
    aiNote: 'Morning caffeine boost',
    date: new Date('2026-05-01'),
    createdAt: new Date('2026-05-01'),
  },
  large: {
    id: 'expense-2',
    userId: 'user-1',
    description: 'Monthly rent payment',
    amount: 10000000,
    category: 'utilities',
    aiNote: 'Essential housing expense',
    date: new Date('2026-05-03'),
    createdAt: new Date('2026-05-03'),
  },
  future: {
    id: 'expense-3',
    userId: 'user-1',
    description: 'Future trip booking',
    amount: 5000000,
    category: 'entertainment',
    aiNote: null,
    date: new Date('2026-12-25'),
    createdAt: new Date('2026-05-02'),
  },
  duplicateCategory: {
    id: 'expense-4',
    userId: 'user-1',
    description: 'Restaurant dinner',
    amount: 250000,
    category: 'food',
    aiNote: 'Evening meal with friends',
    date: new Date('2026-05-04'),
    createdAt: new Date('2026-05-04'),
  },
  zeroAmount: {
    id: 'expense-5',
    userId: 'user-1',
    description: 'Free sample event',
    amount: 0,
    category: 'other',
    aiNote: null,
    date: new Date('2026-05-05'),
    createdAt: new Date('2026-05-05'),
  },
};

export const testReports = {
  current: {
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
  },
  previous: {
    id: 'report-2',
    userId: 'user-1',
    year: 2026,
    month: 4,
    score: 65,
    scoreReason: 'High entertainment spending this month',
    summary: 'You spent more on entertainment than usual.',
    leaks: [
      {
        name: 'Entertainment',
        amount: 500000,
        tip: 'Set a budget for entertainment.',
      },
    ],
    wins: ['Maintained food budget'],
    categoryTotals: {
      food: 450000,
      transport: 150000,
      entertainment: 500000,
      other: 100000,
    },
    generatedAt: new Date('2026-04-01T12:00:00Z'),
  },
};

export const testDtos = {
  validRegister: {
    email: 'newuser@example.com',
    password: 'SecurePass@123',
    name: 'New User',
  },
  validLogin: {
    email: 'user@example.com',
    password: 'Test@1234',
  },
  validExpense: {
    description: 'Lunch expense',
    amount: 75000,
    date: new Date('2026-05-05').toISOString().split('T')[0],
  },
  invalidEmail: {
    email: 'not-an-email',
    password: 'SecurePass@123',
    name: 'User',
  },
  invalidPassword: {
    email: 'user@example.com',
    password: 'short', // Less than 8 chars
    name: 'User',
  },
  invalidExpense: {
    description: '',
    amount: -50000,
  },
};
