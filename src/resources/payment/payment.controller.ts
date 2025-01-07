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
}
