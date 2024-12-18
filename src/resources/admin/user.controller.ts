import { BaseController } from '@/resources/base.controller';
import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { UserService } from '@/resources/user/user.service';
import { GroupService } from '@/resources/user/group.service';
import { UserCreateInput, UserGroupCreateInput } from '@/types/admin.type';

@Controller('admin/user')
export class AdminUserController extends BaseController {
  constructor(
    private readonly userService: UserService,
    private readonly groupService: GroupService,
  ) {
    super();
  }

  @Post('new')
  async registerUser(@Body() body: any, @Res() res: any) {
    try {
      const newUser = this.transferData<UserCreateInput>(body, {
        must: ['userId', 'pwd', 'branchName', 'branchManager', 'branchContact'],
      });
      await this.userService.createUser(newUser as UserCreateInput);
    } catch (e) {
      if (
        e.message === this.CONTROLLER_EXCEPTIONS.DATA_TRANSFER_INVALID ||
        e.message === UserService.USER_SERVICE_EXCEPTIONS.USER_EXISTS
      ) {
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

  @Post('group/new')
  async registerUserGroup(@Body() body: any, @Res() res: any) {
    try {
      const newGroup = this.transferData<UserGroupCreateInput>(body, {
        must: ['groupName', 'description'],
      });
      await this.groupService.createGroup(newGroup as UserGroupCreateInput);
    } catch (e) {
      if (
        e.message === this.CONTROLLER_EXCEPTIONS.DATA_TRANSFER_INVALID ||
        e.message === GroupService.GROUP_SERVICE_EXCEPTIONS.GROUP_EXISTS
      ) {
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
}
