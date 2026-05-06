"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportResultSchema = exports.reportSectionSchema = exports.categorizedExpensesSchema = exports.categorizedExpenseSchema = void 0;
exports.validateCategorizedExpenses = validateCategorizedExpenses;
exports.validateReportResult = validateReportResult;
const zod_1 = require("zod");
exports.categorizedExpenseSchema = zod_1.z.object({
    description: zod_1.z.string(),
    category: zod_1.z.string(),
    ai_note: zod_1.z.string().optional().nullable(),
});
exports.categorizedExpensesSchema = zod_1.z.array(exports.categorizedExpenseSchema);
exports.reportSectionSchema = zod_1.z.object({
    heading: zod_1.z.string(),
    content: zod_1.z.string(),
});
exports.reportResultSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    summary: zod_1.z.string(),
    sections: zod_1.z.array(exports.reportSectionSchema).optional(),
    score: zod_1.z.number().optional(),
    score_reason: zod_1.z.string().optional(),
    leaks: zod_1.z
        .array(zod_1.z.object({
        name: zod_1.z.string(),
        amount: zod_1.z.number(),
        tip: zod_1.z.string(),
    }))
        .optional(),
    wins: zod_1.z.array(zod_1.z.string()).optional(),
});
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
function validateCategorizedExpenses(data) {
    try {
        const parsed = exports.categorizedExpensesSchema.parse(data);
        return parsed.map((expense) => ({
            ...expense,
            category: VALID_CATEGORIES.includes(expense.category)
                ? expense.category
                : 'other',
        }));
    }
    catch {
        return [];
    }
}
function validateReportResult(data) {
    try {
        const parsed = exports.reportResultSchema.parse(data);
        const score = typeof parsed.score === 'number'
            ? Math.max(0, Math.min(100, parsed.score))
            : 50;
        return {
            ...parsed,
            score,
            leaks: parsed.leaks ?? [],
            wins: parsed.wins ?? [],
        };
    }
    catch {
        return {
            summary: 'Unable to generate report. Please try again.',
            score: 50,
            score_reason: 'Error in report generation',
            leaks: [],
            wins: [],
        };
    }
}
//# sourceMappingURL=ai.schemas.js.map