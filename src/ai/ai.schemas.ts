import { z } from 'zod';

export const categorizedExpenseSchema = z.object({
  description: z.string(),
  category: z.string(),
  ai_note: z.string().optional().nullable(),
});

export const categorizedExpensesSchema = z.array(categorizedExpenseSchema);

export const reportSectionSchema = z.object({
  heading: z.string(),
  content: z.string(),
});

export const reportResultSchema = z.object({
  title: z.string().optional(),
  summary: z.string(),
  sections: z.array(reportSectionSchema).optional(),
  score: z.number().optional(),
  score_reason: z.string().optional(),
  leaks: z
    .array(
      z.object({
        name: z.string(),
        amount: z.number(),
        tip: z.string(),
      }),
    )
    .optional(),
  wins: z.array(z.string()).optional(),
});

export type CategorizedExpense = z.infer<typeof categorizedExpenseSchema>;
export type CategorizedExpenses = z.infer<typeof categorizedExpensesSchema>;
export type ReportResult = z.infer<typeof reportResultSchema>;

const VALID_CATEGORIES = [
  'food',
  'transport',
  'entertainment',
  'subscriptions',
  'shopping',
  'health',
  'education',
  'utilities',
  'other',
];

export function validateCategorizedExpenses(
  data: unknown,
): CategorizedExpenses {
  try {
    const parsed = categorizedExpensesSchema.parse(data);
    return parsed.map((expense) => ({
      ...expense,
      category: VALID_CATEGORIES.includes(expense.category)
        ? expense.category
        : 'other',
    }));
  } catch {
    return [];
  }
}

export function validateReportResult(data: unknown): ReportResult {
  try {
    const parsed = reportResultSchema.parse(data);
    const score =
      typeof parsed.score === 'number'
        ? Math.max(0, Math.min(100, parsed.score))
        : 50;
    return {
      ...parsed,
      score,
      leaks: parsed.leaks ?? [],
      wins: parsed.wins ?? [],
    };
  } catch {
    return {
      summary: 'Unable to generate report. Please try again.',
      score: 50,
      score_reason: 'Error in report generation',
      leaks: [],
      wins: [],
    };
  }
}
