import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { BaseController } from '@/resources/base.controller';
import { UserGuard } from '@/guards/user.guard';

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
}
