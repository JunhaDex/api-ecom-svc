import { Module } from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { ShipmentController } from './shipment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentEntity } from '@/resources/shipment/entities/shipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShipmentEntity])],
  controllers: [ShipmentController],
  providers: [ShipmentService],
  exports: [ShipmentService],
})
export class ShipmentModule {}
