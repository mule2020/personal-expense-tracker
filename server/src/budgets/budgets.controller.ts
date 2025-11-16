import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly service: BudgetsService) {}

  @Get()
  getAll(@Req() req: any) {
    return this.service.findAll(req.user.userId);
  }

  @Get(':month')
  getByMonth(@Param('month') month: string, @Req() req: any) {
    return this.service.findOneByMonth(month, req.user.userId);
  }

  @Post()
  upsert(@Body() dto: CreateBudgetDto, @Req() req: any) {
    return this.service.upsert(dto, req.user.userId);
  }
}
