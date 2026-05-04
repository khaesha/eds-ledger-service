import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { ChatService } from './chat.service';
import { ChatDto } from './chat.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post()
  ask(@CurrentUser() user: { id: string }, @Body() dto: ChatDto) {
    return this.chatService.ask(user.id, dto.message);
  }
}
