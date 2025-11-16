import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from './expense.entity';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Injectable()
export class ExpensesService {
    constructor(
    @InjectRepository(Expense)
    private repo: Repository<Expense>,
  ) {}

  findAll(){
    return this.repo.find({order: {date: 'DESC'}});
  }

  create(dto: CreateExpenseDto){
    const expense = this.repo.create(dto);
    return this.repo.save(expense);
  }

  async update(id: number, dto: CreateExpenseDto) {
  const expense = await this.repo.findOne({ where: { id } });
  if (!expense) {
    throw new NotFoundException('Expense not found');
  }
  Object.assign(expense, dto);
  return this.repo.save(expense);
}

async remove(id: number) {
  const res = await this.repo.delete(id);
  if (res.affected === 0) {
    throw new NotFoundException('Expense not found');
  }
  return { message: 'Expense deleted successfully' };
}


  async summaryByCategory() {
    return this.repo
      .createQueryBuilder('e')
      .select('e.category', 'category')
      .addSelect('SUM(e.amount)', 'total')
      .groupBy('e.category')
      .getRawMany();
  }

  async summaryByMonth() {
    return this.repo
      .createQueryBuilder('e')
      .select("TO_CHAR(e.date, 'YYYY-MM')", 'month')
      .addSelect('SUM(e.amount)', 'total')
      .groupBy("TO_CHAR(e.date, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();
  }



}
