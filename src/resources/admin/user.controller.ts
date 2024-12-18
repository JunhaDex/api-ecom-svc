import { BaseController } from '@/resources/base.controller';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { UserService } from '@/resources/user/user.service';
import { GroupService } from '@/resources/user/group.service';
import {
  Product,
  UserCreateInput,
  UserGroupCreateInput,
} from '@/types/admin.type';

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

  @Get('list')
  async getUsers(@Query() query: any, @Res() res: any) {
    const options = this.transferData(query, {
      must: [],
      optional: ['page', 'size', 'by_id', 'by_branch'],
    });
    const result = await this.userService.getUserList({
      page: {
        pageNo: options.page ?? 1,
        pageSize: options.size ?? 10,
      },
      search: {
        userId: options.by_id,
        branchName: options.by_branch,
      },
    });
    return res
      .code(HttpStatus.OK)
      .send(this.formatResponse(HttpStatus.OK, result));
  }

  @Get('group/list')
  async getUserGroupList(@Query() query: any, @Res() res: any) {
    const options = this.transferData(query, {
      must: [],
      optional: ['page', 'size', 'by_name'],
    });
    const result = await this.groupService.getGroupList({
      page: {
        pageNo: options.page ?? 1,
        pageSize: options.size ?? 10,
      },
      search: {
        groupName: options.by_name,
      },
    });
    return res
      .code(HttpStatus.OK)
      .send(this.formatResponse(HttpStatus.OK, result));
  }

  @Get('group/:id')
  async getUserGroup(@Param('id', ParseIntPipe) id: number, @Res() res: any) {
    try {
      const result = await this.groupService.getGroup(id);
      return res
        .code(HttpStatus.OK)
        .send(this.formatResponse(HttpStatus.OK, result));
    } catch (e) {
      if (e.message === GroupService.GROUP_SERVICE_EXCEPTIONS.GROUP_NOT_FOUND) {
        return res
          .code(HttpStatus.NOT_FOUND)
          .send(this.formatResponse(HttpStatus.NOT_FOUND));
      } else {
        Logger.error('Unhandled Error: ' + e.message);
        return res
          .code(HttpStatus.INTERNAL_SERVER_ERROR)
          .send(this.formatResponse(HttpStatus.INTERNAL_SERVER_ERROR));
      }
    }
  }

  @Post('group/:id/product/add')
  async addGroupProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Res() res: any,
  ) {
    try {
      console.log(body);
      const cleaned = this.transferData(body, {
        must: ['products'],
      });
      if (Array.isArray(cleaned.products) && cleaned.products.length) {
        const products = cleaned.products.map((product: any) => {
          return this.transferData<Product>(product, {
            must: ['id', 'productName'],
          }) as Product;
        });
        await this.groupService.addGroupProduct(id, products);
      }
    } catch (e) {
      if (e.message === this.CONTROLLER_EXCEPTIONS.DATA_TRANSFER_INVALID) {
        return res
          .code(HttpStatus.BAD_REQUEST)
          .send(this.formatResponse(HttpStatus.BAD_REQUEST));
      } else if (
        e.message === GroupService.GROUP_SERVICE_EXCEPTIONS.GROUP_NOT_FOUND
      ) {
        return res
          .code(HttpStatus.NOT_FOUND)
          .send(this.formatResponse(HttpStatus.NOT_FOUND));
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
