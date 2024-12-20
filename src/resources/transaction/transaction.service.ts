import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionEntity } from '@/resources/transaction/entities/transaction.entity';
import { Repository } from 'typeorm';
import { TransactionCreateInput } from '@/types/admin.type';
import { PaymentService } from '@/resources/payment/payment.service';
import { PaymentEntity } from '@/resources/payment/entities/payment.entity';

@Injectable()
export class TransactionService {
  static TRANSACTION_SERVICE_EXCEPTIONS = {
    TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
  } as const;

  private readonly Exceptions =
    TransactionService.TRANSACTION_SERVICE_EXCEPTIONS;

  constructor(
    private paymentSvc: PaymentService,
    @InjectRepository(TransactionEntity)
    private txRepo: Repository<TransactionEntity>,
  ) {}

  async createTransaction(transaction: TransactionCreateInput) {
    await this.txRepo.manager.transaction(async (txManager) => {
      const payment = (await this.paymentSvc.createPayment(
        transaction.payment,
        txManager,
      )) as PaymentEntity;
      const tx = this.txRepo.create({
        paymentId: payment.id,
        txName: transaction.txName,
        txNote: transaction.txNote,
        userId: transaction.issuer.id,
        status: 1,
      });
      const txResult = await txManager.save(TransactionEntity, tx);

    });
  }
}
