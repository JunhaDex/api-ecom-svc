import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CourierEntity } from '@/resources/shipment/entities/courier.entity';
import { TransactionEntity } from '@/resources/transaction/entities/transaction.entity';

@Entity({ name: 'shipment' })
export class ShipmentEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  txId: number;
  @Column()
  courierId: number;
  @Column()
  address: string;
  @Column()
  recipientName: string;
  @Column()
  recipientPhone: string;
  @Column()
  trackingNo: string;
  @Column()
  status: number;
  @Column()
  createdAt: Date;
  @Column()
  updatedAt: Date;
  @ManyToOne(() => CourierEntity)
  @JoinColumn({ name: 'courier_id' })
  courier: CourierEntity;
  @OneToOne(() => TransactionEntity, (transaction) => transaction.shipment)
  @JoinColumn({ name: 'tx_id' })
  transaction: TransactionEntity;
}
