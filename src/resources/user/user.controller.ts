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
import { UserService } from './user.service';
import { LoginInput } from '@/types/general.type';
import { BaseController } from '@/resources/base.controller';
import { TransactionService } from '@/resources/transaction/transaction.service';
import { UserGuard } from '@/guards/user.guard';

@Controller('user')
export class UserController extends BaseController {
  constructor(
    private readonly userService: UserService,
  ) {
    super();
  }

  @Post('login')
  async login(@Body() cred: LoginInput, @Res() res: any) {
    try {
      const result = await this.userService.loginUser({
        userId: cred.userId,
        pwd: cred.password,
      });
      console.log(result);
      return res
        .code(HttpStatus.OK)
        .send(this.formatResponse(HttpStatus.OK, result));
    } catch (e) {
      Logger.log(`ACCESS DENIED: ${JSON.stringify(cred)} :::::: ${e.message}`);
      return res
        .code(HttpStatus.FORBIDDEN)
        .send(this.formatResponse(HttpStatus.FORBIDDEN));
    }
  }
}
