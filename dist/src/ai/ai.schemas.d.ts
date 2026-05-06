import { z } from 'zod';
export declare const categorizedExpenseSchema: z.ZodObject<{
    description: z.ZodString;
    category: z.ZodString;
    ai_note: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    category: string;
    ai_note?: string | null | undefined;
}, {
    description: string;
    category: string;
    ai_note?: string | null | undefined;
}>;
export declare const categorizedExpensesSchema: z.ZodArray<z.ZodObject<{
    description: z.ZodString;
    category: z.ZodString;
    ai_note: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    description: string;
    category: string;
    ai_note?: string | null | undefined;
}, {
    description: string;
    category: string;
    ai_note?: string | null | undefined;
}>, "many">;
export declare const reportSectionSchema: z.ZodObject<{
    heading: z.ZodString;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    heading: string;
    content: string;
}, {
    heading: string;
    content: string;
}>;
export declare const reportResultSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    summary: z.ZodString;
    sections: z.ZodOptional<z.ZodArray<z.ZodObject<{
        heading: z.ZodString;
        content: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        heading: string;
        content: string;
    }, {
        heading: string;
        content: string;
    }>, "many">>;
    score: z.ZodOptional<z.ZodNumber>;
    score_reason: z.ZodOptional<z.ZodString>;
    leaks: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        amount: z.ZodNumber;
        tip: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        name: string;
        amount: number;
        tip: string;
    }, {
        name: string;
        amount: number;
        tip: string;
    }>, "many">>;
    wins: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    summary: string;
    title?: string | undefined;
    sections?: {
        heading: string;
        content: string;
    }[] | undefined;
    score?: number | undefined;
    score_reason?: string | undefined;
    leaks?: {
        name: string;
        amount: number;
        tip: string;
    }[] | undefined;
    wins?: string[] | undefined;
}, {
    summary: string;
    title?: string | undefined;
    sections?: {
        heading: string;
        content: string;
    }[] | undefined;
    score?: number | undefined;
    score_reason?: string | undefined;
    leaks?: {
        name: string;
        amount: number;
        tip: string;
    }[] | undefined;
    wins?: string[] | undefined;
}>;
export type CategorizedExpense = z.infer<typeof categorizedExpenseSchema>;
export type CategorizedExpenses = z.infer<typeof categorizedExpensesSchema>;
export type ReportResult = z.infer<typeof reportResultSchema>;
export declare function validateCategorizedExpenses(data: unknown): CategorizedExpenses;
export declare function validateReportResult(data: unknown): ReportResult;
