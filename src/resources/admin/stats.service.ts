import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionEntity } from '@/resources/transaction/entities/transaction.entity';
import { MoreThan, Repository } from 'typeorm';
import { LogTxExportEntity } from '@/resources/admin/entities/tx_log.entity';
import { LogTxData } from '@/types/admin.type';
import { SheetsProvider } from '@/providers/sheets.provider';
import dayjs from 'dayjs';
import { timestamp } from 'rxjs';

@Injectable()
export class StatsService {
  static AUDIT_KEY = {
    userId: '지점번호',
    branchName: '지점명',
    orderId: '거래 식별자',
    txName: '거래 건',
    txTotalPaid: '결제 총액',
    productName: '판매상품',
    perPaid: '판매가',
    paymentMethod: '결제 수단',
    paidAt: '거래 일자',
    txStatus: '상태',
    courier: '택배사',
    trackingNo: '송장번호',
    address: '배송지',
  };
  private readonly sheetsProvider = new SheetsProvider();

  constructor(
    @InjectRepository(TransactionEntity)
    private txRepo: Repository<TransactionEntity>,
    @InjectRepository(LogTxExportEntity)
    private lteRepo: Repository<LogTxExportEntity>,
  ) {}

  async exportTxLog(): Promise<LogTxData[]> {
    const latest = await this.sheetsProvider.findNextEmpty('Sync', 'paidAt');
    const timestamp = latest.timestamp.length
      ? dayjs(latest.timestamp).utc().toDate()
      : new Date('2023-01-01');
    const txList = await this.txRepo.find({
      where: { createdAt: MoreThan(timestamp) },
      relations: {
        user: true,
        payment: true,
        shipment: {
          courier: true,
        },
        products: {
          product: true,
        },
      },
    });
    const convertStatus = (status: number): string => {
      switch (status) {
        case 4:
          return '완료';
        case 5:
          return '환불';
        default:
          return '진행중';
      }
    };
    const logData = txList.map((tx) => {
      const txStatus = convertStatus(tx.status);
      const semiPaidAt = dayjs(tx.payment.paidAt).format('YYYY-MM-DD HH:mm:ss');
      const semiAddress = tx.shipment?.address
        ? tx.shipment.address.replace(/###/g, ' ') +
          ` 우편번호: ${tx.shipment.postalCode}`
        : '';
      return tx.products.map((each) => {
        return {
          userId: tx.user.id,
          branchName: tx.user.branchName,
          orderId: tx.payment.orderId,
          txName: tx.txName,
          txTotalPaid: tx.payment.paidAmount,
          productName: each.product.productName,
          perPaid: each.price,
          paymentMethod: tx.payment.payMethod,
          txStatus,
          courier: tx.shipment?.courier?.courierName ?? '',
          trackingNo: tx.shipment?.trackingNo ?? '',
          address: semiAddress,
          paidAt: semiPaidAt,
        } as LogTxData;
      }) as LogTxData[];
    });
    return logData.flat();
  }

  async updateLedger(logs: LogTxData[]): Promise<void> {
    const latest = await this.sheetsProvider.findNextEmpty('Sync', 'paidAt');
    await this.sheetsProvider.writeToSheet(
      'Sync',
      latest.index,
      StatsService.AUDIT_KEY,
      logs,
    );
  }
}
