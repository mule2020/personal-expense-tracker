import { IsNotEmpty, IsNumber, IsPositive, IsString, IsDateString } from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsNumber({}, { message: 'Amount must be a number' })
  @IsPositive({ message: 'Amount must be greater than 0' })
  amount: number;

  @IsString()
  @IsNotEmpty({ message: 'Category is required' })
  category: string;

  @IsDateString({}, { message: 'Invalid date format' })
  date: string;
}
