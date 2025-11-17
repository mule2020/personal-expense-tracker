import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('numeric')
  amount: number;

  @Column()
  category: string;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD

  @ManyToOne(() => User, user => user.expenses, { onDelete: 'CASCADE' })
  user: User;
}
