import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { testUsers } from '../__tests__/fixtures/test-data';

describe('ChatController', () => {
  let controller: ChatController;
  let chatService: ChatService;

  beforeEach(async () => {
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
    }).compile();

    controller = module.get<ChatController>(ChatController);
    chatService = module.get<ChatService>(ChatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('ask', () => {
    it('should call chatService.ask with user ID and message', async () => {
      const user = { id: testUsers.standard.id };
      const dto = { message: 'How am I doing?' };

      (chatService.ask as jest.Mock).mockResolvedValue({
        reply: 'Your spending looks good!',
      });

      await controller.ask(user, dto);

      expect(chatService.ask).toHaveBeenCalledWith(user.id, dto.message);
    });

    it('should return the chat response', async () => {
      const user = { id: testUsers.standard.id };
      const dto = { message: 'Test message' };
      const mockResponse = { reply: 'Ed says: You good!' };

      (chatService.ask as jest.Mock).mockResolvedValue(mockResponse);

      const result = await controller.ask(user, dto);

      expect(result).toEqual(mockResponse);
      expect(result).toHaveProperty('reply');
    });

    it('should use user ID from CurrentUser decorator', async () => {
      const user = { id: testUsers.standard.id };
      const dto = { message: 'Message' };

      (chatService.ask as jest.Mock).mockResolvedValue({ reply: 'Response' });

      await controller.ask(user, dto);

      const callArgs = (chatService.ask as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toBe(user.id);
    });

    it('should pass exact message from DTO', async () => {
      const user = { id: testUsers.standard.id };
      const message = 'What about my entertainment spending?';
      const dto = { message };

      (chatService.ask as jest.Mock).mockResolvedValue({ reply: 'Response' });

      await controller.ask(user, dto);

      const callArgs = (chatService.ask as jest.Mock).mock.calls[0];
      expect(callArgs[1]).toBe(message);
    });

    it('should handle different user contexts separately', async () => {
      const user1 = { id: testUsers.standard.id };
      const user2 = { id: testUsers.other.id };
      const dto = { message: 'Test' };

      (chatService.ask as jest.Mock).mockResolvedValue({ reply: 'Response' });

      await controller.ask(user1, dto);
      await controller.ask(user2, dto);

      const calls = (chatService.ask as jest.Mock).mock.calls;
      expect(calls[0][0]).toBe(user1.id);
      expect(calls[1][0]).toBe(user2.id);
    });
  });
});
