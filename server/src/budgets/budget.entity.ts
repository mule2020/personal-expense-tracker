import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Budget {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  month: string; // YYYY-MM

  @Column('numeric')
  amount: number;
}
