import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  TransactionEntity,
  TransactionProductEntity,
} from '@/resources/transaction/entities/transaction.entity';
import { Between, Repository } from 'typeorm';
import {
  Transaction,
  TransactionCreateInput,
  TxAdminItem,
} from '@/types/admin.type';
import { PaymentService } from '@/resources/payment/payment.service';
import { PaymentEntity } from '@/resources/payment/entities/payment.entity';
import { Paginate, SvcQuery } from '@/types/general.type';
import { getMonthRange } from '@/utils/index.util';
import { TossPayload } from '@/types/service.type';
import axios from 'axios';

@Injectable()
export class TransactionService {
  static TRANSACTION_SERVICE_EXCEPTIONS = {
    TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
    TX_EXPIRED: 'TX_EXPIRED',
  } as const;

  private readonly Exceptions =
    TransactionService.TRANSACTION_SERVICE_EXCEPTIONS;

  constructor(
    private paymentSvc: PaymentService,
    @InjectRepository(TransactionEntity)
    private txRepo: Repository<TransactionEntity>,
    @InjectRepository(TransactionProductEntity)
    private txProductRepo: Repository<TransactionProductEntity>,
  ) {}

  async createTransaction(userId: number, transaction: TransactionCreateInput) {
    await this.txRepo.manager.transaction(async (txManager) => {
      // create unauthorized payment
      const payment = (await this.paymentSvc.createPayment(
        transaction.payment,
        txManager,
      )) as PaymentEntity;
      const tx = this.txRepo.create({
        paymentId: payment.id,
        txName: transaction.txName,
        txNote: transaction.txNote,
        userId: userId,
        status: 2,
      });
      const txResult = await txManager.save(TransactionEntity, tx);
      const txProducts = transaction.products.map((product) => {
        return this.txProductRepo.create({
          txId: txResult.id,
          productId: product.item.id,
          count: product.quantity,
          price: product.item.productPrice,
          status: 1, // for partial refund
        });
      });
      await txManager.save(TransactionProductEntity, txProducts);
    });
  }

  async confirmTransaction(userId: number, confirmToss: TossPayload) {
    const widgetSecretKey = '';
    const encryptedSecretKey =
      'Basic ' + Buffer.from(widgetSecretKey + ':').toString('base64');
    const tx = await this.getTransactionByOrderId(userId, confirmToss.orderId);
    if (tx && tx.status === 2) {
      const client = axios.create({
        baseURL: 'https://api.tosspayments.com/v1/payments',
        headers: {
          Authorization: encryptedSecretKey,
          'Content-Type': 'application/json',
        },
      });
      const res = await client.post('confirm', confirmToss);
      console.log(res);
      await this.txRepo.manager.transaction(async (txManager) => {
        await this.paymentSvc.updatePayment(
          tx.payment.id,
          {
            paymentKey: confirmToss.paymentKey,
            payMethod: res.data.method,
          },
          txManager,
        );
        await txManager.update(TransactionEntity, tx.id, {
          status: 1,
        });
      });
      return;
    }
    throw new Error(this.Exceptions.TX_EXPIRED);
  }

  async getTransactionList(options?: SvcQuery): Promise<Paginate<TxAdminItem>> {
    const searchOptions = ['status'];
    const take = options?.page?.pageSize ?? 10;
    const skip = ((options?.page?.pageNo ?? 1) - 1) * take;
    let whereClause: { (key: string): any } = undefined;
    if (options?.search) {
      whereClause = Object.keys(options.search).reduce((acc, key) => {
        if (searchOptions.includes(key)) {
          acc[key] = options.search[key];
        }
        return acc;
      }, {} as any);
    }
    const [list, total] = await this.txRepo.findAndCount({
      where: whereClause as any,
      relations: {
        products: {
          product: true,
        },
        user: true,
        shipment: true,
        payment: true,
      },
      take,
      skip,
    });
    return {
      list: list.map((tx) => ({
        id: tx.id,
        txName: tx.txName,
        txNote: tx.txNote,
        status: tx.status,
        payment: tx.payment,
        user: {
          id: tx.user.id,
          userId: tx.user.userId,
          branchName: tx.user.branchName,
          branchManager: tx.user.branchManager,
          branchContact: tx.user.branchContact,
        },
        products: tx.products.map((txp) => {
          return {
            product: txp.product,
            count: txp.count,
            price: txp.price,
          };
        }),
        shipment: tx.shipment ?? null,
        createdAt: tx.createdAt,
      })),
      meta: {
        pageNo: options?.page?.pageNo ?? 1,
        pageSize: take,
        totalCount: total,
        totalPage: Math.ceil(total / take),
      },
    };
  }

  async getTransactionByOrderId(
    userId: number,
    orderId: string,
  ): Promise<Transaction> {
    return await this.txRepo.findOne({
      where: { userId, payment: { orderId } },
      relations: ['payment'],
    });
  }

  // async updateTransactionShipment(
  //   index: number,
  //   params: ShipmentCreateInput,
  // ): Promise<void> {
  //   const tx = await this.txRepo.findOne({
  //     where: { id: index },
  //     relations: ['shipment'],
  //   });
  //   if (tx) {
  //     if (tx.shipment) {
  //       await this.shipmentSvc.updateShipment(tx.shipment.id, params);
  //     } else {
  //       await this.shipmentSvc.createShipment({ ...params, txId: index });
  //     }
  //     return;
  //   }
  //   throw new Error(this.Exceptions.TRANSACTION_NOT_FOUND);
  // }

  async getUserTxSummary(
    userId: number,
  ): Promise<{ count: number; cost: number; in_transit: number }> {
    const range = getMonthRange();
    const [monTx, txCount] = await this.txRepo.findAndCount({
      relations: ['payment'],
      where: { userId, createdAt: Between(range.first, range.last) },
    });
    const transit = await this.txRepo.count({
      relations: ['shipment'],
      where: { userId, shipment: { status: 1 } },
    });
    const spend = monTx.reduce((acc, tx) => {
      return acc + tx.payment.balanceAmount;
    }, 0);
    return {
      count: txCount,
      cost: spend,
      in_transit: transit,
    };
  }
}
