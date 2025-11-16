import { Injectable } from '@nestjs/common';
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
