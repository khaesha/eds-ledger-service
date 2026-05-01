import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get(':year/:month')
  getReport(
    @CurrentUser() user: { id: string },
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.reportsService.getReport(user.id, year, month);
  }

  @Post(':year/:month/generate')
  generateReport(
    @CurrentUser() user: { id: string },
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.reportsService.generateReport(user.id, year, month);
  }
}
