import {
  IsString,
  IsInt,
  IsPositive,
  IsOptional,
  IsDateString,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsDateString()
  date?: string;
}
