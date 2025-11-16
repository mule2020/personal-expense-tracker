import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly service: BudgetsService) {}

  @Get()
  getAll() {
    return this.service.findAll();
  }

  @Get(':month')
  getByMonth(@Param('month') month: string) {
    return this.service.findOneByMonth(month);
  }

  @Post()
  upsert(@Body() dto: CreateBudgetDto) {
    return this.service.upsert(dto);
  }
}
