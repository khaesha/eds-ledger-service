import { JwtService } from '@nestjs/jwt';

export const createMockJwtService = () => ({
  sign: jest.fn((payload: any, options?: any) => {
    return `mock_jwt_token_${payload.sub}_${Date.now()}`;
  }),
  verify: jest.fn((token: string, options?: any) => {
    return {
      sub: 'user-1',
      email: 'test@example.com',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 900,
    };
  }),
  decode: jest.fn((token: string) => {
    return {
      sub: 'user-1',
      email: 'test@example.com',
    };
  }),
} as unknown as JwtService);
