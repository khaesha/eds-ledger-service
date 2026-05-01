import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateExpenseDto } from './expenses.dto';
import * as path from 'path';
import * as fs from 'fs';
import { parse as csvParse } from 'csv-parse/sync';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async findAll(userId: string) {
    return this.prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async create(userId: string, dto: CreateExpenseDto) {
    let category = 'other';
    let aiNote: string | null = null;

    try {
      const [categorized] = await this.ai.categorizeExpenses([
        { description: dto.description, amount: dto.amount },
      ]);
      if (categorized) {
        category = categorized.category;
        aiNote = categorized.ai_note ?? null;
      }
    } catch {
      // AI categorization failed — save expense with fallback values
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

  async remove(userId: string, expenseId: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id: expenseId },
    });
    if (!expense || expense.userId !== userId) {
      throw new NotFoundException('Expense not found');
    }
    return this.prisma.expense.delete({ where: { id: expenseId } });
  }

  async importCsv(userId: string, filePath: string) {
    const absolutePath = path.resolve(filePath);
    const content = fs.readFileSync(absolutePath, 'utf-8');
    fs.unlinkSync(absolutePath);

    let rows: { description: string; amount: string; date?: string }[];
    try {
      rows = csvParse(content, { columns: true, skip_empty_lines: true });
    } catch {
      throw new BadRequestException('Invalid CSV format');
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
      throw new BadRequestException('No valid rows found in CSV');
    }

    let categorized: import('../ai/ai.service').CategorizedExpense[] = [];
    try {
      categorized = await this.ai.categorizeExpenses(
        toProcess.map((r) => ({ description: r.description, amount: r.amount })),
      );
    } catch {
      // AI unavailable — import with fallback category
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
}
