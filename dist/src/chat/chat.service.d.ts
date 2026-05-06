import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { LoggerService } from '../common/logger/pino-logger.service';
export declare class ChatService {
    private readonly prisma;
    private readonly ai;
    private readonly logger;
    constructor(prisma: PrismaService, ai: AiService, logger: LoggerService);
    ask(userId: string, message: string): Promise<{
        reply: string;
    }>;
    private detectAndLogInjectionAttempts;
}
