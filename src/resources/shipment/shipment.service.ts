import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShipmentEntity } from '@/resources/shipment/entities/shipment.entity';
import { EntityManager, Repository } from 'typeorm';
import { Shipment, ShipmentCreateInput } from '@/types/admin.type';
import { TransactionService } from '@/resources/transaction/transaction.service';
import { Paginate, SvcQuery } from '@/types/general.type';
import { CourierEntity } from '@/resources/shipment/entities/courier.entity';

@Injectable()
export class ShipmentService {
  static SHIPMENT_SERVICE_EXCEPTIONS = {
    SHIPMENT_EXIST: 'SHIPMENT_EXIST',
    SHIPMENT_NOT_FOUND: 'SHIPMENT_NOT_FOUND',
  };
  private readonly Exceptions = ShipmentService.SHIPMENT_SERVICE_EXCEPTIONS;

  constructor(
    @Inject(forwardRef(() => TransactionService))
    private txSvc: TransactionService,
    @InjectRepository(ShipmentEntity)
    private shipmentRepository: Repository<ShipmentEntity>,
  ) {}

  async createShipment(
    userId: number,
    newShipment: ShipmentCreateInput,
  ): Promise<void> {
    const tx = await this.txSvc.getTransactionByOrderId(
      userId,
      newShipment.orderId,
    );
    if (tx) {
      const exist = await this.shipmentRepository.findOne({
        where: { txId: tx.id },
      });
      if (!exist) {
        const shipment = this.shipmentRepository.create({
          txId: tx.id,
          address: newShipment.address,
          postalCode: newShipment.postalCode,
          recipientName: newShipment.recipientName,
          recipientPhone: newShipment.recipientPhone,
          status: 1,
        });
        await this.shipmentRepository.save(shipment);
        return;
      }
    }
    throw new Error(this.Exceptions.SHIPMENT_EXIST);
  }

  async getShipmentList(options?: SvcQuery): Promise<Paginate<Shipment>> {
    const take = options?.page?.pageSize ?? 10;
    const skip = ((options?.page?.pageNo ?? 1) - 1) * take;
    const [list, total] = await this.shipmentRepository.findAndCount({
      relations: ['courier'],
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

  async updateShipment(
    index: number,
    params: ShipmentCreateInput,
    manager?: EntityManager,
  ): Promise<void> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: index },
    });
    if (shipment) {
      shipment.courierId = params.courierId;
      shipment.address = params.address;
      shipment.status = params.status;
      shipment.recipientName = params.recipientName;
      shipment.recipientPhone = params.recipientPhone;
      shipment.trackingNo = params.trackingNo;
      shipment.status = params?.status ?? 1;
      if (manager) {
        await manager.save(ShipmentEntity, shipment);
        return;
      }
      await this.shipmentRepository.save(shipment);
      return;
    }
    throw new Error(this.Exceptions.SHIPMENT_NOT_FOUND);
  }

  async deleteShipment(index: number, manager?: EntityManager): Promise<void> {
    if (manager) {
      await manager.delete(ShipmentEntity, { id: index });
      return;
    }
    await this.shipmentRepository.delete({ id: index });
  }
}
