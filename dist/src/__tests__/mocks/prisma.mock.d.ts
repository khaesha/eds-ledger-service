export type MockPrismaService = any;
export declare const createMockPrismaService: () => MockPrismaService;
export declare const createMockPrismaUser: () => {
    id: string;
    email: string;
    password: string;
    name: string;
    createdAt: Date;
};
export declare const createMockPrismaExpense: (overrides?: {}) => {
    id: string;
    userId: string;
    description: string;
    amount: number;
    category: string;
    aiNote: string;
    date: Date;
    createdAt: Date;
};
export declare const createMockPrismaMonthlyReport: (overrides?: {}) => {
    id: string;
    userId: string;
    year: number;
    month: number;
    score: number;
    scoreReason: string;
    summary: string;
    leaks: {
        name: string;
        amount: number;
        tip: string;
    }[];
    wins: string[];
    categoryTotals: {
        food: number;
        transport: number;
        entertainment: number;
        other: number;
    };
    generatedAt: Date;
};
