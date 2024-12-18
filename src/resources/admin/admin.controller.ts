import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminCreateInput } from '@/types/admin.type';
import { BaseController } from '@/resources/base.controller';

@Controller('admin/auth')
export class AdminController extends BaseController {
  constructor(private readonly adminService: AdminService) {
    super();
  }

  @Post('new')
  async registerAdmin(@Body() body: any, @Res() res: any) {
    try {
      const newAdmin = this.transferData<AdminCreateInput>(body, {
        must: ['userId', 'pwd', 'name'],
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
}
