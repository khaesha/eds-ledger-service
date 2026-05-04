import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service';
import { createMockPrismaService } from '../src/__tests__/mocks/prisma.mock';
import { createMockJwtService } from '../src/__tests__/mocks/jwt.mock';
import { testUsers, testDtos } from '../src/__tests__/fixtures/test-data';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('Auth E2E', () => {
  let app: INestApplication;
  let authService: AuthService;
  let prismaService: ReturnType<typeof createMockPrismaService>;
  let jwtService: ReturnType<typeof createMockJwtService>;

  beforeAll(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
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

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
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

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(dto.email);
    });

    it('should return 400 for invalid email', async () => {
      const dto = testDtos.invalidEmail;

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(400);
    });

    it('should return 400 for invalid password (too short)', async () => {
      const dto = testDtos.invalidPassword;

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(400);
    });

    it('should return 409 for duplicate email', async () => {
      const dto = testDtos.validRegister;

      prismaService.user.findUnique.mockResolvedValue(testUsers.standard);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const dto = testDtos.validLogin;

      prismaService.user.findUnique.mockResolvedValue(testUsers.standard);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(dto)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
    });

    it('should not return password hash', async () => {
      const dto = testDtos.validLogin;

      prismaService.user.findUnique.mockResolvedValue(testUsers.standard);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(dto)
        .expect(200);

      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 401 for invalid credentials', async () => {
      const dto = testDtos.validLogin;

      prismaService.user.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(dto)
        .expect(401);
    });

    it('should return 401 for wrong password', async () => {
      const dto = testDtos.validLogin;

      prismaService.user.findUnique.mockResolvedValue(testUsers.standard);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(dto)
        .expect(401);
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user when authenticated', async () => {
      const token = 'mock_jwt_token_user-1_123456';

      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
    });

    it('should return 401 without auth header', async () => {
      await request(app.getHttpServer()).get('/auth/me').expect(401);
    });
  });
});
