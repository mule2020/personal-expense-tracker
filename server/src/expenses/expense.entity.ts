import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
