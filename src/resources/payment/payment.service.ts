import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentEntity } from '@/resources/payment/entities/payment.entity';
import { EntityManager, Repository } from 'typeorm';
import { PaymentCreateInput } from '@/types/admin.type';
import { randomUUID } from 'node:crypto';
import { PaySessionEntity } from '@/resources/payment/entities/pay_session.entity';

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
    @InjectRepository(PaySessionEntity)
    private pSessionRepo: Repository<PaySessionEntity>,
  ) {}

  async createPayment(
    userId: number,
    newPayment: PaymentCreateInput,
    manager?: EntityManager,
  ): Promise<void | PaymentEntity> {
    await this.checkPaySession(userId, {
      sessionId: newPayment.orderId,
      amount: newPayment.paidAmount,
    });
    const payment = this.paymentRepository.create({
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

  async startPaySession(userId: number, amount: number): Promise<string> {
    const sessionId = randomUUID();
    const pSession = this.pSessionRepo.create({
      userId,
      sessionId,
      amount,
    });
    await this.pSessionRepo.save(pSession);
    return sessionId;
  }

  async checkPaySession(
    userId: number,
    paySession: {
      sessionId: string;
      amount: number;
    },
  ): Promise<boolean> {
    const pSession = await this.pSessionRepo.findOne({
      where: { userId, sessionId: paySession.sessionId },
    });
    if (pSession && pSession.amount === paySession.amount) {
      return true;
    }
    throw new Error(this.Exceptions.PAY_SESSION_INVALID);
  }
}
