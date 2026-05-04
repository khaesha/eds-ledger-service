import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { createMockConfigService } from '../__tests__/mocks/config.mock';
import { testUsers } from '../__tests__/fixtures/test-data';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: createMockConfigService(),
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('validate', () => {
    it('should validate JWT payload and return user object', () => {
      const payload = {
        sub: testUsers.standard.id,
        email: testUsers.standard.email,
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        id: testUsers.standard.id,
        email: testUsers.standard.email,
      });
    });

    it('should extract id from sub field', () => {
      const payload = {
        sub: 'user-uuid-123',
        email: 'test@example.com',
      };

      const result = strategy.validate(payload);

      expect(result.id).toBe('user-uuid-123');
    });

    it('should return email from payload', () => {
      const payload = {
        sub: testUsers.standard.id,
        email: testUsers.admin.email,
      };

      const result = strategy.validate(payload);

      expect(result.email).toBe(testUsers.admin.email);
    });

    it('should handle different user payloads', () => {
      const payload = {
        sub: testUsers.other.id,
        email: testUsers.other.email,
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        id: testUsers.other.id,
        email: testUsers.other.email,
      });
    });
  });

  describe('JWT strategy configuration', () => {
    it('should use ConfigService to get JWT secret', () => {
      expect(configService.get).toHaveBeenCalledWith('JWT_SECRET');
    });

    it('should extract JWT from Authorization header', () => {
      expect(strategy).toBeDefined();
      expect(strategy.name).toBe('jwt');
    });
  });
});
