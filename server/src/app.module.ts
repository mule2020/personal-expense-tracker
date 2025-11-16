import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpensesModule } from './expenses/expenses.module';
import { Expense } from './expenses/expense.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'expense_tracker',
      entities: [Expense],
      synchronize: true, // dev only
    }),
    ExpensesModule,
  ],
})
export class AppModule {}
