import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentEntity } from '@/resources/payment/entities/payment.entity';
import { EntityManager, Repository } from 'typeorm';
import { Payment, PaymentCreateInput } from '@/types/admin.type';
import { Paginate, SvcQuery } from '@/types/general.type';

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

  async getPaymentList(options?: SvcQuery): Promise<Paginate<Payment>> {
    return {
      list: [],
      meta: {
        pageSize: 0,
        pageNo: 0,
        totalPage: 0,
        totalCount: 0,
      },
    };
  }
}
