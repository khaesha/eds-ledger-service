export declare const testUsers: {
    standard: {
        id: string;
        email: string;
        password: string;
        passwordHash: string;
        name: string;
        createdAt: Date;
    };
    admin: {
        id: string;
        email: string;
        password: string;
        passwordHash: string;
        name: string;
        createdAt: Date;
    };
    other: {
        id: string;
        email: string;
        password: string;
        passwordHash: string;
        name: string;
        createdAt: Date;
    };
};
export declare const testExpenses: {
    normal: {
        id: string;
        userId: string;
        description: string;
        amount: number;
        category: string;
        aiNote: string;
        date: Date;
        createdAt: Date;
    };
    large: {
        id: string;
        userId: string;
        description: string;
        amount: number;
        category: string;
        aiNote: string;
        date: Date;
        createdAt: Date;
    };
    future: {
        id: string;
        userId: string;
        description: string;
        amount: number;
        category: string;
        aiNote: null;
        date: Date;
        createdAt: Date;
    };
    duplicateCategory: {
        id: string;
        userId: string;
        description: string;
        amount: number;
        category: string;
        aiNote: string;
        date: Date;
        createdAt: Date;
    };
    zeroAmount: {
        id: string;
        userId: string;
        description: string;
        amount: number;
        category: string;
        aiNote: null;
        date: Date;
        createdAt: Date;
    };
};
export declare const testReports: {
    current: {
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
    previous: {
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
};
export declare const testDtos: {
    validRegister: {
        email: string;
        password: string;
        name: string;
    };
    validLogin: {
        email: string;
        password: string;
    };
    validExpense: {
        description: string;
        amount: number;
        date: string;
    };
    invalidEmail: {
        email: string;
        password: string;
        name: string;
    };
    invalidPassword: {
        email: string;
        password: string;
        name: string;
    };
    invalidExpense: {
        description: string;
        amount: number;
    };
};
