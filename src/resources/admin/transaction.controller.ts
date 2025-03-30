import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from '@/resources/base.controller';
import { TransactionService } from '@/resources/transaction/transaction.service';
import { UpdateTrackingInput } from '@/types/admin.type';
import { CourierService } from '@/resources/shipment/courier.service';
import { AdminGuard } from '@/guards/admin.guard';

@Controller('admin/tx')
@UseGuards(AdminGuard)
export class TransactionController extends BaseController {
  constructor(
    private readonly txService: TransactionService,
    private readonly courierService: CourierService,
  ) {
    super();
  }

  @Get('list')
  async listTransactions(@Query() query: any, @Res() res: any) {
    const options = this.transferData(query, {
      must: [],
      optional: ['page', 'size'],
    });
    const result = await this.txService.getTransactionList({
      page: {
        pageNo: options.page,
        pageSize: options.size,
      },
    });
    return res
      .code(HttpStatus.OK)
      .send(this.formatResponse(HttpStatus.OK, result));
  }

  @Get(':id')
  async getTransaction(@Param('id', ParseIntPipe) id: number, @Res() res: any) {
    try {
      const result = await this.txService.getTransaction(id);
      return res
        .code(HttpStatus.OK)
        .send(this.formatResponse(HttpStatus.OK, result));
    } catch (e) {
      if (
        e.message ===
        TransactionService.TRANSACTION_SERVICE_EXCEPTIONS.TRANSACTION_NOT_FOUND
      ) {
        return res
          .code(HttpStatus.NOT_FOUND)
          .send(this.formatResponse(HttpStatus.NOT_FOUND));
      } else {
        return res
          .code(HttpStatus.INTERNAL_SERVER_ERROR)
          .send(this.formatResponse(HttpStatus.INTERNAL_SERVER_ERROR));
      }
    }
  }

  @Put(':id/shipment')
  async updateTxShipment(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Res() res: any,
  ) {
    try {
      const txUpdate = this.transferData<UpdateTrackingInput>(body, {
        must: ['trackingNo', 'courierId', 'status'],
      });
      console.log(txUpdate);
      await this.txService.updateTransactionShipment(
        id,
        txUpdate as UpdateTrackingInput,
      );
    } catch (e) {
      if (e.message === this.CONTROLLER_EXCEPTIONS.DATA_TRANSFER_INVALID) {
        return res
          .code(HttpStatus.BAD_REQUEST)
          .send(this.formatResponse(HttpStatus.BAD_REQUEST));
      } else {
        Logger.error('Unhandled Error: ' + e.message);
        return res
          .code(HttpStatus.INTERNAL_SERVER_ERROR)
          .send(this.formatResponse(HttpStatus.INTERNAL_SERVER_ERROR));
      }
    }
    return res.code(HttpStatus.OK).send(this.formatResponse(HttpStatus.OK));
  }

  @Get('courier/list')
  async listCouriers(@Query() query: any, @Res() res: any) {
    const options = this.transferData(query, {
      must: [],
      optional: ['page', 'size'],
    });
    const result = await this.courierService.getCourierList({
      page: {
        pageNo: options.page,
        pageSize: options.size,
      },
    });
    return res
      .code(HttpStatus.OK)
      .send(this.formatResponse(HttpStatus.OK, result));
  }

  @Get('shipment/list')
  async listShipments(@Query() query: any, @Res() res: any) {
    const options = this.transferData(query, {
      must: [],
      optional: ['page', 'size'],
    });
    const result = await this.txService.getShipmentList({
      page: {
        pageNo: options.page,
        pageSize: options.size,
      },
    });
    return res
      .code(HttpStatus.OK)
      .send(this.formatResponse(HttpStatus.OK, result));
  }

  @Post('courier/new')
  async createCourier(@Body() body: any, @Res() res: any) {}

  @Put('courier/:id')
  async updateCourier(
    @Param('id') id: number,
    @Body() body: any,
    @Res() res: any,
  ) {}

  @Delete('courier/:id')
  async deleteCourier(@Param('id') id: number, @Res() res: any) {}

  @Post('auto-track')
  async updateShipmentStatus(@Res() res: any) {
    await this.txService.trackShipment();
    return res.code(HttpStatus.OK).send(this.formatResponse(HttpStatus.OK));
  }
}
