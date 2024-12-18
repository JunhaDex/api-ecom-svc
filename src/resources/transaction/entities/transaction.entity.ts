import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PaymentEntity } from '@/resources/payment/entities/payment.entity';
import { ProductEntity } from '@/resources/product/entities/product.entity';

@Entity({ name: 'transaction' })
export class TransactionEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  paymentId: number;
  @Column()
  txName: string;
  @Column()
  txNote: string;
  @Column()
  userId: number;
  @Column()
  status: number;
  @Column()
  createdAt: Date;
  @Column()
  updatedAt: Date;
  @OneToOne(() => PaymentEntity, (payment) => payment.transaction)
  @JoinColumn({ name: 'payment_id' })
  payment: PaymentEntity;
  @ManyToMany(() => ProductEntity)
  @JoinTable({
    name: 'transaction_product',
    joinColumn: {
      name: 'tx_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'product_id',
      referencedColumnName: 'id',
    },
  })
  products: ProductEntity[];
}

@Entity({ name: 'transaction_product' })
export class TransactionProductEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  txId: number;
  @Column()
  productId: number;
  @Column()
  count: number;
  @Column()
  price: number;
  @Column()
  status: number;
  @Column()
  createdAt: Date;
  @ManyToOne(() => TransactionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tx_id' })
  transaction: TransactionEntity;
  @ManyToOne(() => ProductEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
