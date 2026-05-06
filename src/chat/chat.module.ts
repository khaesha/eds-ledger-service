import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [CommonModule, AiModule],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
