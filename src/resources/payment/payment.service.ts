import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentEntity } from '@/resources/payment/entities/payment.entity';
import { EntityManager, Repository } from 'typeorm';
import { PaymentCreateInput } from '@/types/admin.type';

@Injectable()
export class PaymentService {
  static PAYMENT_SERVICE_EXCEPTIONS = {
    PAYMENT_NOT_FOUND: 'PAYMENT_NOT_FOUND',
    PAY_SESSION_INVALID: 'PAY_SESSION_INVALID',
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
      orderId: newPayment.orderId,
      paidAmount: newPayment.paidAmount,
      balanceAmount: newPayment.paidAmount,
      paidAt: newPayment.paidAt,
    });
    if (manager) {
      return await manager.save(PaymentEntity, payment);
    }
    await this.paymentRepository.save(payment);
  }

  async updatePayment(
    index: number,
    params: {
      paymentKey: string;
      payMethod: string;
      url?: string;
    },
    manager?: EntityManager,
  ): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { id: index },
    });
    if (payment) {
      payment.paymentKey = params.paymentKey;
      payment.payMethod = params.payMethod;
      payment.receiptUrl = params.url;
      if (manager) {
        await manager.save(PaymentEntity, payment);
        return;
      }
      await this.paymentRepository.save(payment);
      return;
    }
    throw new Error(this.Exceptions.PAYMENT_NOT_FOUND);
  }

  async cancelPaymentAll(
    index: number,
    manager?: EntityManager,
  ): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { id: index },
    });
    if (payment) {
      payment.balanceAmount = 0;
      if (manager) {
        await manager.save(PaymentEntity, payment);
        return;
      }
      await this.paymentRepository.save(payment);
      return;
    }
    throw new Error(this.Exceptions.PAYMENT_NOT_FOUND);
  }

  async deletePayment(index: number, manager?: EntityManager): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { id: index },
    });
    if (payment) {
      if (manager) {
        await manager.remove(PaymentEntity, payment);
        return;
      }
      await this.paymentRepository.remove(payment);
      return;
    }
  }
}
