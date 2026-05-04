import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { testUsers, testDtos } from '../__tests__/fixtures/test-data';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should call authService.register with DTO', async () => {
      const dto = testDtos.validRegister;
      const mockResponse = {
        user: { id: testUsers.standard.id, email: dto.email },
        token: 'mock_token',
      };

      (authService.register as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResponse);
    });

    it('should return user and token on successful registration', async () => {
      const dto = testDtos.validRegister;
      const mockResponse = {
        user: {
          id: 'new-user-id',
          email: dto.email,
          name: dto.name,
          createdAt: new Date(),
        },
        token: 'jwt_token_123',
      };

      (authService.register as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.register(dto);

      expect(result.user).toHaveProperty('email', dto.email);
      expect(result.token).toBeDefined();
    });
  });

  describe('login', () => {
    it('should call authService.login with DTO', async () => {
      const dto = testDtos.validLogin;
      const mockResponse = {
        user: { id: testUsers.standard.id, email: dto.email },
        token: 'mock_token',
      };

      (authService.login as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResponse);
    });

    it('should return user and token on successful login', async () => {
      const dto = testDtos.validLogin;
      const mockResponse = {
        user: {
          id: testUsers.standard.id,
          email: testUsers.standard.email,
          name: testUsers.standard.name,
        },
        token: 'jwt_token_456',
      };

      (authService.login as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.login(dto);

      expect(result.user).toHaveProperty('id');
      expect(result.token).toBeDefined();
    });
  });

  describe('me', () => {
    it('should return current user from request', () => {
      const mockRequest = {
        user: { id: testUsers.standard.id, email: testUsers.standard.email },
      } as any;

      const result = controller.me(mockRequest);

      expect(result).toEqual(mockRequest.user);
      expect(result.id).toBe(testUsers.standard.id);
    });
  });
});
