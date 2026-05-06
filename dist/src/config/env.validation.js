"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
exports.validateEnv = validateEnv;
const zod_1 = require("zod");
exports.envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(['development', 'production', 'test'])
        .default('development'),
    PORT: zod_1.z.coerce.number().default(3001),
    DATABASE_URL: zod_1.z.string().url(),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    OPENROUTER_API_KEY: zod_1.z.string().min(1, 'OPENROUTER_API_KEY is required'),
    FRONTEND_URL: zod_1.z.string().url(),
});
function validateEnv(env) {
    try {
        return exports.envSchema.parse(env);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join('.')}: ${err.message}`)
                .join('\n');
            throw new Error(`Environment validation failed:\n${errorMessages}`);
        }
        throw error;
    }
}
//# sourceMappingURL=env.validation.js.map