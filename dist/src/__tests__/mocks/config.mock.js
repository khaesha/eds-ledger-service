"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMockConfigService = void 0;
const createMockConfigService = (overrides = {}) => ({
    get: jest.fn((key) => {
        const defaults = {
            OPENROUTER_API_KEY: 'test-api-key-123',
            JWT_SECRET: 'test-jwt-secret-key',
            DATABASE_URL: 'postgresql://test:test@localhost:5432/eds_test',
            NODE_ENV: 'test',
        };
        return overrides[key] ?? defaults[key];
    }),
    getOrThrow: jest.fn((key) => {
        const value = overrides[key];
        if (!value)
            throw new Error(`Config key not found: ${key}`);
        return value;
    }),
});
exports.createMockConfigService = createMockConfigService;
//# sourceMappingURL=config.mock.js.map