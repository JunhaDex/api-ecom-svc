import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserEntity } from '@/resources/admin/entities/admin.entity';
import { AdminProductController } from '@/resources/admin/product.controller';
import { ProductService } from '@/resources/product/product.service';
import {
  ProductEntity,
  UserGroupProductEntity,
} from '@/resources/product/entities/product.entity';
import { AdminUserController } from '@/resources/admin/user.controller';
import { UserService } from '@/resources/user/user.service';
import { UserEntity } from '@/resources/user/entities/user.entity';
import { GroupService } from '@/resources/user/group.service';
import { UserGroupEntity } from '@/resources/user/entities/group.entity';
import { TransactionController } from '@/resources/admin/transaction.controller';
import { TransactionService } from '@/resources/transaction/transaction.service';
import { PaymentService } from '@/resources/payment/payment.service';
import { ShipmentService } from '@/resources/shipment/shipment.service';
import { PaymentEntity } from '@/resources/payment/entities/payment.entity';
import { ShipmentEntity } from '@/resources/shipment/entities/shipment.entity';
import {
  TransactionEntity,
  TransactionProductEntity,
} from '@/resources/transaction/entities/transaction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminUserEntity,
      UserEntity,
      ProductEntity,
      UserGroupEntity,
      UserGroupProductEntity,
      TransactionEntity,
      TransactionProductEntity,
      PaymentEntity,
      ShipmentEntity,
    ]),
  ],
  controllers: [
    AdminController,
    AdminProductController,
    AdminUserController,
    TransactionController,
  ],
  providers: [
    AdminService,
    ProductService,
    UserService,
    GroupService,
    TransactionService,
    PaymentService,
    ShipmentService,
  ],
})
export class AdminModule {}
