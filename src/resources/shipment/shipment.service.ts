import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShipmentEntity } from '@/resources/shipment/entities/shipment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ShipmentService {
  static SHIPMENT_SERVICE_EXCEPTIONS = {
    SHIPMENT_NOT_FOUND: 'SHIPMENT_NOT_FOUND',
  };
  private readonly Exceptions = ShipmentService.SHIPMENT_SERVICE_EXCEPTIONS;

  constructor(
    @InjectRepository(ShipmentEntity)
    private shipmentRepository: Repository<ShipmentEntity>,
  ) {}
}
