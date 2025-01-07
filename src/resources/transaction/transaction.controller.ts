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
import { TossPayload } from '@/types/service.type';

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

  @Post('init')
  @UseGuards(UserGuard)
  async initTransaction(@Body() body: any, @Req() req: any, @Res() res: any) {
    try {
      const payload = this.transferData<TransactionCreateInput>(body, {
        must: ['payment', 'txName', 'txNote', 'products'],
      });
      await this.txService.createTransaction(
        req.user.id,
        payload as TransactionCreateInput,
      );
      return res.code(HttpStatus.OK).send(this.formatResponse(HttpStatus.OK));
    } catch (e) {
      Logger.error('Unhandled Error: ' + e.message);
      return res
        .code(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(this.formatResponse(HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  @Post('confirm')
  @UseGuards(UserGuard)
  async confirmTransaction(
    @Body() body: any,
    @Req() req: any,
    @Res() res: any,
  ) {
    try {
      const payload = this.transferData<TossPayload>(body, {
        must: ['amount', 'orderId', 'paymentKey'],
      }) as TossPayload;
      await this.txService.confirmTransaction(req.user.id, payload);
      return res.code(HttpStatus.OK).send(this.formatResponse(HttpStatus.OK));
    } catch (e) {
      if (e.message === this.CONTROLLER_EXCEPTIONS.DATA_TRANSFER_INVALID) {
        return res
          .code(HttpStatus.BAD_REQUEST)
          .send(this.formatResponse(HttpStatus.BAD_REQUEST));
      } else if (
        e.message ===
        TransactionService.TRANSACTION_SERVICE_EXCEPTIONS.TX_EXPIRED
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
