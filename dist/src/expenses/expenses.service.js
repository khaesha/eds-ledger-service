"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ai_service_1 = require("../ai/ai.service");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const sync_1 = require("csv-parse/sync");
let ExpensesService = class ExpensesService {
    prisma;
    ai;
    constructor(prisma, ai) {
        this.prisma = prisma;
        this.ai = ai;
    }
    async findAll(userId) {
        return this.prisma.expense.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
        });
    }
    async create(userId, dto) {
        let category = 'other';
        let aiNote = null;
        try {
            const [categorized] = await this.ai.categorizeExpenses([
                { description: dto.description, amount: dto.amount },
            ]);
            if (categorized) {
                category = categorized.category;
                aiNote = categorized.ai_note ?? null;
            }
        }
        catch {
        }
        return this.prisma.expense.create({
            data: {
                userId,
                description: dto.description,
                amount: dto.amount,
                date: dto.date ? new Date(dto.date) : new Date(),
                category,
                aiNote,
            },
        });
    }
    async remove(userId, expenseId) {
        const expense = await this.prisma.expense.findUnique({
            where: { id: expenseId },
        });
        if (!expense || expense.userId !== userId) {
            throw new common_1.NotFoundException('Expense not found');
        }
        return this.prisma.expense.delete({ where: { id: expenseId } });
    }
    async importCsv(userId, filePath) {
        const absolutePath = path.resolve(filePath);
        const content = fs.readFileSync(absolutePath, 'utf-8');
        fs.unlinkSync(absolutePath);
        let rows;
        try {
            rows = (0, sync_1.parse)(content, { columns: true, skip_empty_lines: true });
        }
        catch {
            throw new common_1.BadRequestException('Invalid CSV format');
        }
        const toProcess = rows
            .filter((r) => r.description && r.amount)
            .map((r) => ({
            description: String(r.description).slice(0, 500),
            amount: parseInt(String(r.amount).replace(/[^0-9]/g, ''), 10),
            date: r.date,
        }))
            .filter((r) => r.amount > 0);
        if (toProcess.length === 0) {
            throw new common_1.BadRequestException('No valid rows found in CSV');
        }
        let categorized = [];
        try {
            categorized = await this.ai.categorizeExpenses(toProcess.map((r) => ({ description: r.description, amount: r.amount })));
        }
        catch {
        }
        const data = toProcess.map((r, i) => ({
            userId,
            description: r.description,
            amount: r.amount,
            date: r.date ? new Date(r.date) : new Date(),
            category: categorized[i]?.category ?? 'other',
            aiNote: categorized[i]?.ai_note ?? null,
        }));
        await this.prisma.expense.createMany({ data });
        return { imported: data.length };
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ai_service_1.AiService])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map