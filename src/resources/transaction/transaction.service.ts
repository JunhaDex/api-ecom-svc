import axios from 'axios';
import * as cheerio from 'cheerio';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
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
  UpdateTrackingInput,
} from '@/types/admin.type';
import { PaymentService } from '@/resources/payment/payment.service';
import { PaymentEntity } from '@/resources/payment/entities/payment.entity';
import { Paginate, SvcQuery } from '@/types/general.type';
import { getMonthRange } from '@/utils/index.util';
import { TossPayload } from '@/types/service.type';
import { ShipmentService } from '@/resources/shipment/shipment.service';
import { ShipmentEntity } from '@/resources/shipment/entities/shipment.entity';

@Injectable()
export class TransactionService {
  static TRANSACTION_SERVICE_EXCEPTIONS = {
    TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
    TX_EXPIRED: 'TX_EXPIRED',
    TX_CANCEL_FAILED: 'TX_CANCEL_FAILED',
  } as const;

  private readonly Exceptions =
    TransactionService.TRANSACTION_SERVICE_EXCEPTIONS;

  constructor(
    private paymentSvc: PaymentService,
    @Inject(forwardRef(() => ShipmentService))
    private shipmentSvc: ShipmentService,
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
    const tossKey = process.env.TOSS_PAY_KEY;
    const encryptedSecretKey =
      'Basic ' + Buffer.from(tossKey + ':').toString('base64');
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
      Logger.log('Payment confirmed: ' + confirmToss);
      await this.txRepo.manager.transaction(async (txManager) => {
        await this.paymentSvc.updatePayment(
          tx.payment.id,
          {
            paymentKey: confirmToss.paymentKey,
            payMethod: res.data.method,
            url: res.data.receipt?.url,
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

  async cancelTransaction(userId: number, orderId: string) {
    const tossKey = process.env.TOSS_PAY_KEY;
    const encryptedSecretKey =
      'Basic ' + Buffer.from(tossKey + ':').toString('base64');
    // https://api.tosspayments.com/v1/payments/{paymentKey}/cancel
    const tx = await this.getTransactionByOrderId(userId, orderId);
    if (tx && tx.status === 1) {
      const client = axios.create({
        baseURL: 'https://api.tosspayments.com/v1/payments',
        headers: {
          Authorization: encryptedSecretKey,
          'Content-Type': 'application/json',
        },
      });
      try {
        const res = await client.post(`${tx.payment.paymentKey}/cancel`, {
          cancelReason: 'User request',
        });
        Logger.log('Payment canceled: ' + orderId + ' :::::: ' + res.data);
        await this.txRepo.manager.transaction(async (txManager) => {
          await this.shipmentSvc.deleteShipment(tx.shipment.id, txManager);
          await this.paymentSvc.cancelPaymentAll(tx.payment.id, txManager);
          await txManager.update(
            TransactionProductEntity,
            {
              txId: tx.id,
            },
            {
              status: 7,
            },
          );
          await txManager.update(TransactionEntity, tx.id, {
            status: 7,
          });
        });
        return;
      } catch (e) {
        Logger.error('Payment cancel failed: ' + orderId + ' :::::: ' + e);
      }
    } else if (tx.status === 2) {
      await this.txRepo.manager.transaction(async (txManager) => {
        await this.shipmentSvc.deleteShipment(tx.shipment.id, txManager);
        await txManager.delete(TransactionProductEntity, {
          txId: tx.id,
        });
        await txManager.delete(TransactionEntity, tx.id);
        await this.paymentSvc.deletePayment(tx.payment.id, txManager);
      });
      return;
    }
    throw new Error(this.Exceptions.TX_CANCEL_FAILED);
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

  async getUserTxList(
    userId: number,
    options?: SvcQuery,
  ): Promise<Paginate<Transaction>> {
    const take = options?.page?.pageSize ?? 10;
    const skip = ((options?.page?.pageNo ?? 1) - 1) * take;
    const [list, total] = await this.txRepo.findAndCount({
      where: { userId },
      relations: {
        products: {
          product: true,
        },
        shipment: true,
        payment: true,
      },
      order: { createdAt: 'DESC' },
      take,
      skip,
    });
    return {
      list,
      meta: {
        pageNo: options?.page?.pageNo ?? 1,
        pageSize: take,
        totalCount: total,
        totalPage: Math.ceil(total / take),
      },
    };
  }

  async getTransaction(index: number): Promise<Transaction> {
    const tx = await this.txRepo.findOne({
      where: { id: index },
      relations: {
        products: {
          product: true,
        },
        user: true,
        shipment: true,
        payment: true,
      },
    });
    if (tx) {
      return tx;
    }
    throw new Error(this.Exceptions.TRANSACTION_NOT_FOUND);
  }

  async getTransactionByOrderId(
    userId: number,
    orderId: string,
  ): Promise<Transaction> {
    return await this.txRepo.findOne({
      where: { userId, payment: { orderId } },
      relations: ['payment', 'shipment'],
    });
  }

  async updateTransactionShipment(
    index: number,
    params: UpdateTrackingInput,
  ): Promise<void> {
    const tx = await this.txRepo.findOne({
      where: { id: index },
      relations: ['shipment'],
    });
    if (tx) {
      if (tx.shipment) {
        await this.txRepo.manager.transaction(async (txManager) => {
          await this.shipmentSvc.updateShipment(
            tx.shipment.id,
            {
              ...tx.shipment,
              orderId: '',
              courierId: params.courierId,
              trackingNo: params.trackingNo,
              status: params.status,
            },
            txManager,
          );
          await txManager.update(TransactionEntity, tx.id, {
            status: 3,
          });
        });
      }
      return;
    }
    throw new Error(this.Exceptions.TRANSACTION_NOT_FOUND);
  }

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

  async trackShipment() {
    const txList = await this.txRepo.find({
      where: { status: 3 },
      relations: { shipment: { courier: true } },
    });
    const shipStatus = await this.getShipmentStatus(txList);
    for (const isShipped of shipStatus) {
      const idx = shipStatus.indexOf(isShipped);
      if (isShipped) {
        txList[idx].status = 4;
        txList[idx].shipment.status = 4;
      }
    }
    const updated = txList.filter((tx) => tx.status === 4);
    this.txRepo.manager.transaction(async (txManager) => {
      const shipments = updated.map((tx) => tx.shipment);
      await txManager.save(ShipmentEntity, shipments);
      await txManager.save(TransactionEntity, updated);
    });
  }

  private async getShipmentStatus(txList: TransactionEntity[]) {
    const shipStatus = await Promise.all(
      txList.map(async (tx) => {
        const courier = tx.shipment.courier;
        if (courier) {
          if (courier.id === 1) {
            // 대한통운
            const client = axios.create({
              baseURL: courier.apiUrl,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
            });
            const res = await client.post('', {
              wblNo: tx.shipment.trackingNo,
            });
            if (res.status === 200) {
              const list = res.data.data.svcOutList;
              const latest = list.pop(); // crgStDnm === 배송완료
              return latest.crgStDnm === '배송완료';
            }
          } else if (courier.id === 2) {
            // 로젠택배
            const client = axios.create({
              baseURL: courier.apiUrl,
              headers: {
                'Content-Type': 'text/html',
              },
            });
            const res = await client.get(tx.shipment.trackingNo);
            const $ = cheerio.load(res.data);
            const table = $('table.tkInfo tbody').text().trim();
            return table.includes('배송완료');
          }
        }
        return false;
      }),
    );
    return shipStatus;
  }
}
