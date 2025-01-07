import { Module } from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { ShipmentController } from './shipment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentEntity } from '@/resources/shipment/entities/shipment.entity';
import { CourierService } from '@/resources/shipment/courier.service';
import { CourierEntity } from '@/resources/shipment/entities/courier.entity';
import { TransactionService } from '@/resources/transaction/transaction.service';
import {
  TransactionEntity,
  TransactionProductEntity,
} from '@/resources/transaction/entities/transaction.entity';
import { PaymentService } from '@/resources/payment/payment.service';
import { PaymentEntity } from '@/resources/payment/entities/payment.entity';
import { UserService } from '@/resources/user/user.service';
import { UserEntity } from '@/resources/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ShipmentEntity,
      CourierEntity,
      TransactionEntity,
      TransactionProductEntity,
      PaymentEntity,
      UserEntity,
    ]),
  ],
  controllers: [ShipmentController],
  providers: [
    ShipmentService,
    CourierService,
    TransactionService,
    PaymentService,
    UserService,
  ],
  exports: [ShipmentService, CourierService],
})
export class ShipmentModule {}
