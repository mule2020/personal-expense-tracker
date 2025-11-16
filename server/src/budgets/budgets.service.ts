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

  findAll(userId: number) {
    return this.repo.find({
      where: { user: { id: userId } },
      order: { month: 'ASC' },
    });
  }

  async findOneByMonth(month: string, userId: number) {
    const budget = await this.repo.findOne({
      where: { month, user: { id: userId } },
    });
    if (!budget) throw new NotFoundException('Budget not found');
    return budget;
  }

  async upsert(dto: CreateBudgetDto, userId: number) {
    let budget = await this.repo.findOne({
      where: { month: dto.month, user: { id: userId } },
    });
    if (!budget) {
      budget = this.repo.create({
        ...dto,
        user: { id: userId } as any,
      });
    } else {
      budget.amount = dto.amount;
    }
    return this.repo.save(budget);
  }
}
