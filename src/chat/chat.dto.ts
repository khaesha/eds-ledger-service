import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ChatDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  message: string;
}
