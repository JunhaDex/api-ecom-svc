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
import { PaymentService } from './payment.service';
import { BaseController } from '@/resources/base.controller';
import { UserGuard } from '@/guards/user.guard';

@Controller('payment')
export class PaymentController extends BaseController {
  constructor(private readonly paymentService: PaymentService) {
    super();
  }

  @Post('session')
  @UseGuards(UserGuard)
  async initSessionProcess(
    @Body() body: any,
    @Req() req: any,
    @Res() res: any,
  ) {
    try {
      const payload = this.transferData(body, {
        must: ['amount'],
      });
      const sessionId = await this.paymentService.startPaySession(
        req.user.id,
        payload.amount,
      );
      return res
        .code(HttpStatus.OK)
        .send(this.formatResponse(HttpStatus.OK, { sessionId }));
    } catch (e) {
      if (
        e.message === this.CONTROLLER_EXCEPTIONS.DATA_TRANSFER_INVALID ||
        e.message ===
          PaymentService.PAYMENT_SERVICE_EXCEPTIONS.PAY_SESSION_INVALID
      ) {
        return res
          .code(HttpStatus.BAD_REQUEST)
          .send(this.formatResponse(HttpStatus.BAD_REQUEST));
      }
      Logger.error('Unhandled error', e.message);
      return res
        .code(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(this.formatResponse(HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }
}
