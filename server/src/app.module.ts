import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesModule } from './expenses/expenses.module';
import { Expense } from './expenses/expense.entity';
import { BudgetsModule } from './budgets/budgets.module';
import { Budget } from './budgets/budget.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'expense_tracker',
      entities: [Expense, Budget, User],
      synchronize: true, // dev only
    }),
    ExpensesModule,
    BudgetsModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
