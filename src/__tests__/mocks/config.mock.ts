import { ConfigService } from '@nestjs/config';

export const createMockConfigService = (overrides: Record<string, any> = {}) => ({
  get: jest.fn((key: string) => {
    const defaults: Record<string, any> = {
      OPENROUTER_API_KEY: 'test-api-key-123',
      JWT_SECRET: 'test-jwt-secret-key',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/eds_test',
      NODE_ENV: 'test',
    };
    return overrides[key] ?? defaults[key];
  }),
  getOrThrow: jest.fn((key: string) => {
    const value = overrides[key];
    if (!value) throw new Error(`Config key not found: ${key}`);
    return value;
  }),
} as unknown as ConfigService);
