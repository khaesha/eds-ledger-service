import { z } from 'zod';
export declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    PORT: z.ZodDefault<z.ZodNumber>;
    DATABASE_URL: z.ZodString;
    JWT_SECRET: z.ZodString;
    OPENROUTER_API_KEY: z.ZodString;
    FRONTEND_URL: z.ZodString;
}, "strip", z.ZodTypeAny, {
    DATABASE_URL: string;
    NODE_ENV: "production" | "development" | "test";
    JWT_SECRET: string;
    OPENROUTER_API_KEY: string;
    PORT: number;
    FRONTEND_URL: string;
}, {
    DATABASE_URL: string;
    JWT_SECRET: string;
    OPENROUTER_API_KEY: string;
    FRONTEND_URL: string;
    NODE_ENV?: "production" | "development" | "test" | undefined;
    PORT?: number | undefined;
}>;
export type EnvConfig = z.infer<typeof envSchema>;
export declare function validateEnv(env: Record<string, unknown>): EnvConfig;
