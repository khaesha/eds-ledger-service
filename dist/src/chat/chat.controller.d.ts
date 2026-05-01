import { ChatService } from './chat.service';
import { ChatDto } from './chat.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    ask(user: {
        id: string;
    }, dto: ChatDto): Promise<{
        reply: string;
    }>;
}
