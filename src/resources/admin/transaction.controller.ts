import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { BaseController } from '@/resources/base.controller';
import { TransactionService } from '@/resources/transaction/transaction.service';

@Controller('admin/tx')
export class TransactionController extends BaseController {
  constructor(private readonly txService: TransactionService) {
    super();
  }

  @Get('list')
  async getTransactions(@Query() query: any, @Res() res: any) {
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

  @Put(':id/shipment')
  async updateTxShipment(@Query() query: any, @Res() res: any) {
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
}
