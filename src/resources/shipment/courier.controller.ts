import { BaseController } from '@/resources/base.controller';
import {
  Body,
  Controller, Delete,
  Get,
  HttpStatus,
  Logger, Param, ParseIntPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { CourierService } from '@/resources/shipment/courier.service';
import { CourierCreateInput } from '@/types/admin.type';

@Controller('admin/courier')
export class AdminCourierController extends BaseController {
  constructor(private readonly courierService: CourierService) {
    super();
  }

  @Post('new')
  async registerCourier(@Body() body: any, @Res() res: any) {
    try {
      const newCourier = this.transferData<CourierCreateInput>(body, {
        must: ['courierName', 'apiUrl'],
      });
      await this.courierService.createCourier(newCourier as CourierCreateInput);
    } catch (e) {
      if (e.message === this.CONTROLLER_EXCEPTIONS.DATA_TRANSFER_INVALID) {
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
  async getCouriers(@Query() query: any, @Res() res: any) {
    const options = this.transferData(query, {
      must: [],
      optional: ['page', 'size', 'by_id', 'by_branch'],
    });
    const result = await this.courierService.getCourierList({
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

  @Delete(':id/remove')
  async removeCouier(@Param('id', ParseIntPipe) id: number, @Res() res: any) {
    await this.courierService.deleteCourier(id);
    return res.code(HttpStatus.OK).send(this.formatResponse(HttpStatus.OK));
  }
}
