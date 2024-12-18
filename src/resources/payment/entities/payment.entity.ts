import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TransactionEntity } from '@/resources/transaction/entities/transaction.entity';

@Entity({ name: 'payment' })
export class PaymentEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  sessionKey: string;
  @Column()
  payMethod: string;
  @Column()
  paymentKey: string;
  @Column()
  orderId: string;
  @Column()
  paidAmount: number;
  @Column()
  balanceAmount: number;
  @Column()
  paidAt: Date;
  @Column()
  createdAt: Date;
  @Column()
  updatedAt: Date;
  @OneToOne(() => TransactionEntity, (transaction) => transaction.payment)
  transaction: TransactionEntity;
}
