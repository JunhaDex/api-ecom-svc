import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { BaseController } from '@/resources/base.controller';
import { UserGuard } from '@/guards/user.guard';
import { TransactionCreateInput } from '@/types/admin.type';

@Controller('tx')
export class TransactionController extends BaseController {
  constructor(private readonly txService: TransactionService) {
    super();
  }

  @Get('dashboard')
  @UseGuards(UserGuard)
  async getUserDashInfo(@Req() req: any, @Res() res: any) {
    try {
      const uid = req.user.id;
      const result = await this.txService.getUserTxSummary(uid);
      return res
        .code(HttpStatus.OK)
        .send(this.formatResponse(HttpStatus.OK, result));
    } catch (e) {
      Logger.error('Unhandled Error: ' + e.message);
      return res
        .code(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(this.formatResponse(HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  @Post('confirm')
  @UseGuards(UserGuard)
  async confirmTx(@Body() body: any, @Req() req: any, @Res() res: any) {
    try {
      const payload = this.transferData<TransactionCreateInput>(body, {
        must: ['issuer', 'payment', 'txName', 'txNote', 'products'],
      });
      await this.txService.createTransaction(payload as TransactionCreateInput);
      await this.txService.confirmTransaction({
        orderId: payload.payment.orderId,
        amount: payload.payment.paidAmount.toString(),
        paymentKey: payload.payment.paymentKey,
      });
      return res.code(HttpStatus.OK).send(this.formatResponse(HttpStatus.OK));
    } catch (e) {
      Logger.error('Unhandled Error: ' + e.message);
      return res
        .code(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(this.formatResponse(HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }
}
