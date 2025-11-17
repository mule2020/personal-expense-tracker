import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Expense } from './expense.entity';
import { Repository } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class ExpensesService {
    constructor(
    @InjectRepository(Expense)
    private repo: Repository<Expense>,
  ) {}

   findAll(userId: number) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { date: 'DESC' },
    });
  }

  create(dto: CreateExpenseDto, userId: number) {
    const expense = this.repo.create({
      ...dto,
      user: { id: userId } as User,
    });
    return this.repo.save(expense);
  }

  async update(id: number, dto: CreateExpenseDto, userId: number) {
    const expense = await this.repo.findOne({
      where: { id, user: { id: userId } },
    });
    if (!expense) throw new NotFoundException('Expense not found');

    Object.assign(expense, dto);
    return this.repo.save(expense);
  }

  async remove(id: number, userId: number) {
    const res = await this.repo.delete({ id, user: { id: userId } as any });
    if (res.affected === 0) throw new NotFoundException('Expense not found');
    return { deleted: true };
  }

  async summaryByCategory(userId: number) {
    return this.repo
      .createQueryBuilder('e')
      .select('e.category', 'category')
      .addSelect('SUM(e.amount)', 'total')
      .where('e.userId = :userId', { userId })
      .groupBy('e.category')
      .getRawMany();
  }

  async summaryByMonth(userId: number) {
    return this.repo
      .createQueryBuilder('e')
      .select("TO_CHAR(e.date, 'YYYY-MM')", 'month')
      .addSelect('SUM(e.amount)', 'total')
      .where('e.userId = :userId', { userId })
      .groupBy("TO_CHAR(e.date, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany();
  }



}
