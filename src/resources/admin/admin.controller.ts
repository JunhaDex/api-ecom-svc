import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminCreateInput } from '@/types/admin.type';
import { BaseController } from '@/resources/base.controller';
import { AdminGuard } from '@/guards/admin.guard';

@Controller('admin/auth')
export class AdminController extends BaseController {
  constructor(private readonly adminService: AdminService) {
    super();
  }

  @Post('login')
  async loginAdmin(@Body() body: any, @Res() res: any) {
    try {
      const loginInfo = this.transferData(body, {
        must: ['adminId', 'pwd'],
      });
      const result = await this.adminService.loginAdmin({
        userId: loginInfo.adminId,
        pwd: loginInfo.pwd,
      });
      return res
        .code(HttpStatus.OK)
        .send(this.formatResponse(HttpStatus.OK, result));
    } catch (e) {
      if (
        e.message === this.CONTROLLER_EXCEPTIONS.DATA_TRANSFER_INVALID ||
        e.message === AdminService.ADMIN_SERVICE_EXCEPTIONS.ADMIN_NOT_FOUND
      ) {
        return res
          .code(HttpStatus.UNAUTHORIZED)
          .send(this.formatResponse(HttpStatus.UNAUTHORIZED));
      } else {
        Logger.error('Unhandled Error: ' + e.message);
        return res
          .code(HttpStatus.INTERNAL_SERVER_ERROR)
          .send(this.formatResponse(HttpStatus.INTERNAL_SERVER_ERROR));
      }
    }
  }

  @Post('new')
  @UseGuards(AdminGuard)
  async registerAdmin(@Body() body: any, @Res() res: any) {
    try {
      const newAdmin = this.transferData<AdminCreateInput>(body, {
        must: ['adminId', 'pwd', 'name'],
      });
      await this.adminService.createAdmin(newAdmin as AdminCreateInput);
    } catch (e) {
      if (
        e.message === this.CONTROLLER_EXCEPTIONS.DATA_TRANSFER_INVALID ||
        e.message === AdminService.ADMIN_SERVICE_EXCEPTIONS.ADMIN_EXISTS
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
  @UseGuards(AdminGuard)
  async getAdmins(@Query() query: any, @Res() res: any) {
    const options = this.transferData(query, {
      must: [],
      optional: ['page', 'size', 'by_id', 'by_name'],
    });
    const result = await this.adminService.getAdminList({
      page: {
        pageNo: options.page ?? 1,
        pageSize: options.size ?? 10,
      },
      search: {
        adminId: options.by_id,
        name: options.by_name,
      },
    });
    return res
      .code(HttpStatus.OK)
      .send(this.formatResponse(HttpStatus.OK, result));
  }

  @Delete(':id/remove')
  @UseGuards(AdminGuard)
  async removeAdmin(@Param('id', ParseIntPipe) id: number, @Res() res: any) {
    await this.adminService.deleteAdmin(id);
    return res.code(HttpStatus.OK).send(this.formatResponse(HttpStatus.OK));
  }
}
