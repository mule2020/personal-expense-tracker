import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Controller('expenses')
export class ExpensesController {
    constructor(private readonly service: ExpensesService) { }

    @Get()
    getAll() {
        return this.service.findAll();
    }

    @Post()
    create(@Body() dto: CreateExpenseDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: CreateExpenseDto,
    ) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.service.remove(id);
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
