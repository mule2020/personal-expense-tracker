import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
    constructor(private readonly service: ExpensesService) { }

   @Get()
  getAll(@Req() req: any) {
    return this.service.findAll(req.user.userId);
  }

  @Post()
  create(@Body() dto: CreateExpenseDto, @Req() req: any) {
    return this.service.create(dto, req.user.userId);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateExpenseDto,
    @Req() req: any,
  ) {
    return this.service.update(id, dto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.remove(id, req.user.userId);
  }

  @Get('summary/category')
  getByCategory(@Req() req: any) {
    return this.service.summaryByCategory(req.user.userId);
  }

  @Get('summary/month')
  getByMonth(@Req() req: any) {
    return this.service.summaryByMonth(req.user.userId);
  }
}
