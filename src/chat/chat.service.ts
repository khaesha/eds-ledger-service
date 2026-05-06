import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { LoggerService } from '../common/logger/pino-logger.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
    private readonly logger: LoggerService,
  ) {}

  async ask(userId: string, message: string) {
    this.detectAndLogInjectionAttempts(userId, message);

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const expenses = await this.prisma.expense.findMany({
      where: { userId, date: { gte: start, lt: end } },
    });

    const categoryTotals: Record<string, number> = {};
    for (const exp of expenses) {
      categoryTotals[exp.category] =
        (categoryTotals[exp.category] ?? 0) + exp.amount;
    }

    const reply = await this.ai.chat(message, categoryTotals);
    return { reply };
  }

  private detectAndLogInjectionAttempts(userId: string, message: string) {
    const injectionPatterns = [
      /system\s*:/i,
      /ignore previous/i,
      /forget everything/i,
      /new instructions/i,
      /jailbreak/i,
    ];

    const hasInjectionPattern = injectionPatterns.some((pattern) =>
      pattern.test(message),
    );

    if (hasInjectionPattern) {
      this.logger.securityEvent({
        type: 'INJECTION_ATTEMPT',
        userId,
        endpoint: '/chat',
        details: { messageLength: message.length },
      });
    }
  }
}
