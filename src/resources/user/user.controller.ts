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
import { UserService } from './user.service';
import { LoginInput, UpdatePasswordInput } from '@/types/general.type';
import { BaseController } from '@/resources/base.controller';
import { UserGuard } from '@/guards/user.guard';

@Controller('user')
export class UserController extends BaseController {
  constructor(private readonly userService: UserService) {
    super();
  }

  @Post('login')
  async login(@Body() cred: LoginInput, @Res() res: any) {
    try {
      const result = await this.userService.loginUser({
        userId: cred.userId,
        pwd: cred.password,
      });
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

  @Post('profile/pwd')
  @UseGuards(UserGuard)
  async updatePwd(
    @Body() body: UpdatePasswordInput,
    @Req() req: any,
    @Res() res: any,
  ) {
    try {
      console.log('req.user.id', req.user.id, body.oldPwd, body.newPwd);
      await this.userService.updateUserPwd(req.user.id, {
        oldPwd: body.oldPwd,
        newPwd: body.newPwd,
      });
      return res.code(HttpStatus.OK).send(this.formatResponse(HttpStatus.OK));
    } catch (e) {
      return res
        .code(HttpStatus.FORBIDDEN)
        .send(this.formatResponse(HttpStatus.FORBIDDEN));
    }
  }
}
