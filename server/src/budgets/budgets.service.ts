import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './budget.entity';
import { CreateBudgetDto } from './dto/create-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private repo: Repository<Budget>,
  ) {}

  findAll() {
    return this.repo.find({ order: { month: 'ASC' } });
  }

  async findOneByMonth(month: string) {
    const budget = await this.repo.findOne({ where: { month } });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }
    return budget;
  }

  async upsert(dto: CreateBudgetDto) {
    let budget = await this.repo.findOne({ where: { month: dto.month } });
    if (!budget) {
      budget = this.repo.create(dto);
    } else {
      budget.amount = dto.amount;
    }
    return this.repo.save(budget);
  }
}
