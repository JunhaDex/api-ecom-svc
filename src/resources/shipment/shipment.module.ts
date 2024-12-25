import { Module } from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { ShipmentController } from './shipment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentEntity } from '@/resources/shipment/entities/shipment.entity';
import { CourierService } from '@/resources/shipment/courier.service';
import { CourierEntity } from '@/resources/shipment/entities/courier.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShipmentEntity, CourierEntity])],
  controllers: [ShipmentController],
  providers: [ShipmentService, CourierService],
  exports: [ShipmentService, CourierService],
})
export class ShipmentModule {}
