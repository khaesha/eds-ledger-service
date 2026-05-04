import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { createMockPrismaService } from '../__tests__/mocks/prisma.mock';
import { createMockJwtService } from '../__tests__/mocks/jwt.mock';
import { testUsers, testDtos } from '../__tests__/fixtures/test-data';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: ReturnType<typeof createMockPrismaService>;
  let jwtService: ReturnType<typeof createMockJwtService>;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: createMockPrismaService(),
        },
        {
          provide: JwtService,
          useValue: createMockJwtService(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const dto = testDtos.validRegister;

      (bcrypt.hash as jest.Mock).mockResolvedValue(
        testUsers.standard.passwordHash,
      );
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue({
        id: testUsers.standard.id,
        email: dto.email,
        name: dto.name,
        createdAt: new Date(),
      });

      const result = await service.register(dto);

      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email', dto.email);
      expect(result.token).toBeDefined();
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 12);
    });

    it('should throw ConflictException if email already exists', async () => {
      const dto = testDtos.validRegister;

      prismaService.user.findUnique.mockResolvedValue(testUsers.standard);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(prismaService.user.create).not.toHaveBeenCalled();
    });

    it('should hash password with bcrypt before storing', async () => {
      const dto = testDtos.validRegister;

      (bcrypt.hash as jest.Mock).mockResolvedValue(
        testUsers.standard.passwordHash,
      );
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue({
        id: testUsers.standard.id,
        email: dto.email,
        name: dto.name,
        createdAt: new Date(),
      });

      await service.register(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 12);
    });
  });

  describe('login', () => {
    it('should successfully login a user with valid credentials', async () => {
      const dto = testDtos.validLogin;
      const mockUser = {
        ...testUsers.standard,
        password: testUsers.standard.passwordHash,
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(dto);

      expect(result.user).toHaveProperty('email', testUsers.standard.email);
      expect(result.user).not.toHaveProperty('password');
      expect(result.token).toBeDefined();
      expect(bcrypt.compare).toHaveBeenCalledWith(
        dto.password,
        mockUser.password,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const dto = testDtos.validLogin;

      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const dto = testDtos.validLogin;
      const mockUser = {
        ...testUsers.standard,
        password: testUsers.standard.passwordHash,
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should not return password hash in response', async () => {
      const dto = testDtos.validLogin;
      const mockUser = {
        ...testUsers.standard,
        password: testUsers.standard.passwordHash,
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(dto);

      expect(result.user).not.toHaveProperty('password');
    });

    it('should compare password with stored hash', async () => {
      const dto = testDtos.validLogin;
      const mockUser = {
        ...testUsers.standard,
        password: testUsers.standard.passwordHash,
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login(dto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        dto.password,
        mockUser.password,
      );
    });
  });

  describe('JWT token generation', () => {
    it('should generate a JWT token with user ID and email', async () => {
      const dto = testDtos.validLogin;

      prismaService.user.findUnique.mockResolvedValue(testUsers.standard);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login(dto);

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: testUsers.standard.id, email: testUsers.standard.email },
        { expiresIn: '15m' },
      );
    });

    it('should set token expiration to 15 minutes', async () => {
      const dto = testDtos.validLogin;

      prismaService.user.findUnique.mockResolvedValue(testUsers.standard);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login(dto);

      const callArgs = (jwtService.sign as jest.Mock).mock.calls[0];
      expect(callArgs[1].expiresIn).toBe('15m');
    });
  });
});
