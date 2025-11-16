import { Body, Controller, Get, Post } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Controller('expenses')
export class ExpensesController {
    constructor(private readonly service: ExpensesService) {}

    @Get()
    getAll(){
        return this.service.findAll();
    }

    @Post()
    create(@Body() dto: CreateExpenseDto){
     return this.service.create(dto);
    }

    @Get('summary/category')
    getByCategory() {
    return this.service.summaryByCategory();
  }

    @Get('summary/month')
    getByMonth() {
        return this.service.summaryByMonth();
    }
}
