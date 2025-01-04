import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  TransactionEntity,
  TransactionProductEntity,
} from '@/resources/transaction/entities/transaction.entity';
import { PaymentService } from '@/resources/payment/payment.service';
import { ShipmentService } from '@/resources/shipment/shipment.service';
import { PaymentEntity } from '@/resources/payment/entities/payment.entity';
import { ShipmentEntity } from '@/resources/shipment/entities/shipment.entity';
import { UserService } from '@/resources/user/user.service';
import { UserEntity } from '@/resources/user/entities/user.entity';
import { PaySessionEntity } from '@/resources/payment/entities/pay_session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TransactionEntity,
      TransactionProductEntity,
      PaySessionEntity,
      PaymentEntity,
      ShipmentEntity,
      UserEntity,
    ]),
  ],
  controllers: [TransactionController],
  providers: [TransactionService, PaymentService, ShipmentService, UserService],
  exports: [TransactionService],
})
export class TransactionModule {}
