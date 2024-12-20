import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShipmentEntity } from '@/resources/shipment/entities/shipment.entity';
import { Repository } from 'typeorm';
import { ShipmentCreateInput } from '@/types/admin.type';

@Injectable()
export class ShipmentService {
  static SHIPMENT_SERVICE_EXCEPTIONS = {
    SHIPMENT_EXIST: 'SHIPMENT_EXIST',
    SHIPMENT_NOT_FOUND: 'SHIPMENT_NOT_FOUND',
  };
  private readonly Exceptions = ShipmentService.SHIPMENT_SERVICE_EXCEPTIONS;

  constructor(
    @InjectRepository(ShipmentEntity)
    private shipmentRepository: Repository<ShipmentEntity>,
  ) {}

  async createShipment(newShipment: ShipmentCreateInput): Promise<void> {
    const already = await this.shipmentRepository.findOne({
      where: { txId: newShipment.txId },
    });
    if (!already) {
      const shipment = this.shipmentRepository.create({
        courierId: newShipment.courierId,
        txId: newShipment.txId,
        status: 1,
      });
      await this.shipmentRepository.save(shipment);
      return;
    }
    throw new Error(this.Exceptions.SHIPMENT_EXIST);
  }

  async updateShipment(
    index: number,
    params: ShipmentCreateInput,
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
      await this.shipmentRepository.save(shipment);
      return;
    }
    throw new Error(this.Exceptions.SHIPMENT_NOT_FOUND);
  }
}
