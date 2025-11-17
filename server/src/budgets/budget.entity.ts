import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  month: string; // YYYY-MM

  @Column('numeric')
  amount: number;

  @ManyToOne(() => User, user => user.budgets, { onDelete: 'CASCADE' })
  user: User;
}
