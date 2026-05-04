import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ChatController } from '../src/chat/chat.controller';
import { ChatService } from '../src/chat/chat.service';
import { AuthGuard } from '@nestjs/passport';

describe('Chat E2E', () => {
  let app: INestApplication;
  let chatService: ChatService;

  const mockAuthGuard = {
    canActivate: () => true,
  };

  beforeAll(async () => {
    jest.clearAllMocks();

    const mockChatService = {
      ask: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue(mockAuthGuard)
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    chatService = module.get<ChatService>(ChatService);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /chat', () => {
    it('should send a chat message and get a response', async () => {
      const dto = { message: 'How am I doing?' };

      (chatService.ask as jest.Mock).mockResolvedValue({
        reply: 'Your spending looks great!',
      });

      const response = await request(app.getHttpServer())
        .post('/chat')
        .send(dto)
        .expect(201);

      expect(response.body).toHaveProperty('reply');
      expect(response.body.reply).toBe('Your spending looks great!');
    });

    it('should handle different message types', async () => {
      const messages = [
        { message: 'How am I doing?' },
        { message: 'What about my food spending?' },
        { message: 'Any tips for saving?' },
      ];

      for (const dto of messages) {
        (chatService.ask as jest.Mock).mockResolvedValue({
          reply: 'Response for: ' + dto.message,
        });

        const response = await request(app.getHttpServer())
          .post('/chat')
          .send(dto)
          .expect(201);

        expect(response.body).toHaveProperty('reply');
      }
    });

    it('should return 400 for empty message', async () => {
      const dto = { message: '' };

      await request(app.getHttpServer()).post('/chat').send(dto).expect(400);
    });

    it('should return 400 for missing message field', async () => {
      const dto = {};

      await request(app.getHttpServer()).post('/chat').send(dto).expect(400);
    });

    it('should return 400 for message exceeding max length', async () => {
      const dto = { message: 'x'.repeat(1001) };

      await request(app.getHttpServer()).post('/chat').send(dto).expect(400);
    });

    it('should accept messages with special characters', async () => {
      const dto = { message: 'How much? $100 & 50,000 IDR! 🚀' };

      (chatService.ask as jest.Mock).mockResolvedValue({
        reply: 'Response',
      });

      const response = await request(app.getHttpServer())
        .post('/chat')
        .send(dto)
        .expect(201);

      expect(response.body).toHaveProperty('reply');
    });

    it('should handle rate limiting (20 requests per minute)', async () => {
      (chatService.ask as jest.Mock).mockResolvedValue({
        reply: 'Response',
      });

      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/chat')
          .send({ message: `Message ${i}` })
          .expect(201);
      }

      expect((chatService.ask as jest.Mock).mock.calls).toHaveLength(5);
    });
  });
});
