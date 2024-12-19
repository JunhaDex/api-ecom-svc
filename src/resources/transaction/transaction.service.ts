import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionEntity } from '@/resources/transaction/entities/transaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TransactionService {
  static TRANSACTION_SERVICE_EXCEPTIONS = {
    TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
  } as const;

  private readonly Exceptions =
    TransactionService.TRANSACTION_SERVICE_EXCEPTIONS;

  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
  ) {}
}
