import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { BaseController } from '@/resources/base.controller';
import { UserGuard } from '@/guards/user.guard';
import { ShipmentCreateInput } from '@/types/admin.type';

@Controller('shipment')
export class ShipmentController extends BaseController {
  constructor(private readonly shipmentService: ShipmentService) {
    super();
  }

  @Post('new')
  @UseGuards(UserGuard)
  async createShipment(@Body() body: any, @Req() req: any, @Res() res: any) {
    try {
      const payload = this.transferData<ShipmentCreateInput>(body, {
        must: [
          'orderId',
          'address',
          'postalCode',
          'recipientName',
          'recipientPhone',
        ],
      }) as ShipmentCreateInput;
      await this.shipmentService.createShipment(req.user.id, payload);
      return res.code(HttpStatus.OK).send(this.formatResponse(HttpStatus.OK));
    } catch (e) {
      if (e.message === this.CONTROLLER_EXCEPTIONS.DATA_TRANSFER_INVALID) {
        return res
          .code(HttpStatus.BAD_REQUEST)
          .send(this.formatResponse(HttpStatus.BAD_REQUEST));
      } else if (
        e.message === ShipmentService.SHIPMENT_SERVICE_EXCEPTIONS.SHIPMENT_EXIST
      ) {
        return res
          .code(HttpStatus.FORBIDDEN)
          .send(this.formatResponse(HttpStatus.FORBIDDEN));
      }
      Logger.error('Unhandled Error: ' + e.message);
      return res
        .code(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(this.formatResponse(HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }
}
