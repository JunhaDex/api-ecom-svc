import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { LoginInput } from '@/types/general.type';
import { BaseController } from '@/resources/base.controller';

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
      Logger.log(`ACCESS DENIED: ${JSON.stringify(cred)} :::::: ${e}`);
      return res
        .code(HttpStatus.FORBIDDEN)
        .send(this.formatResponse(HttpStatus.FORBIDDEN));
    }
  }
}
