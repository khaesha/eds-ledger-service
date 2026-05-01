import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './expenses.dto';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    findAll(user: {
        id: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        description: string;
        amount: number;
        date: Date;
        userId: string;
        category: string;
        aiNote: string | null;
    }[]>;
    create(user: {
        id: string;
    }, dto: CreateExpenseDto): Promise<{
        id: string;
        createdAt: Date;
        description: string;
        amount: number;
        date: Date;
        userId: string;
        category: string;
        aiNote: string | null;
    }>;
    remove(user: {
        id: string;
    }, id: string): Promise<{
        id: string;
        createdAt: Date;
        description: string;
        amount: number;
        date: Date;
        userId: string;
        category: string;
        aiNote: string | null;
    }>;
    importCsv(user: {
        id: string;
    }, file: Express.Multer.File): Promise<{
        imported: number;
    }>;
}
