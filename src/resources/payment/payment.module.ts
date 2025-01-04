import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from '@/resources/payment/entities/payment.entity';
import { PaySessionEntity } from '@/resources/payment/entities/pay_session.entity';
import { UserService } from '@/resources/user/user.service';
import { UserEntity } from '@/resources/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, PaymentEntity, PaySessionEntity]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService, UserService],
  exports: [PaymentService],
})
export class PaymentModule {}
