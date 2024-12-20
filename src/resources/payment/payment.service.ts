import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentEntity } from '@/resources/payment/entities/payment.entity';
import { EntityManager, Repository } from 'typeorm';
import { PaymentCreateInput } from '@/types/admin.type';

@Injectable()
export class PaymentService {
  static PAYMENT_SERVICE_EXCEPTIONS = {
    PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',
  } as const;

  private readonly Exceptions = PaymentService.PAYMENT_SERVICE_EXCEPTIONS;

  constructor(
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
  ) {}

  async createPayment(
    newPayment: PaymentCreateInput,
    manager?: EntityManager,
  ): Promise<void | PaymentEntity> {
    const payment = this.paymentRepository.create({
      sessionKey: newPayment.sessionKey,
      payMethod: newPayment.payMethod,
      paymentKey: newPayment.paymentKey,
      orderId: newPayment.orderId,
      paidAmount: newPayment.paidAmount,
      balanceAmount: newPayment.balanceAmount,
      paidAt: newPayment.paidAt,
    });
    if (manager) {
      return await manager.save(PaymentEntity, payment);
    }
    await this.paymentRepository.save(payment);
  }
}
