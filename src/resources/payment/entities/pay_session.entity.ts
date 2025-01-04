import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'pay_session' })
export class PaySessionEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  sessionId: string;
  @Column()
  userId: number;
  @Column()
  amount: number;
  @Column()
  createdAt: Date;
  @Column()
  updatedAt: Date;
}
