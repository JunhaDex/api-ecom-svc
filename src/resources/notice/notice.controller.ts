import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Query,
  Res,
} from '@nestjs/common';
import { NoticeService } from './notice.service';
import { BaseController } from '@/resources/base.controller';

@Controller('notice')
export class NoticeController extends BaseController {
  constructor(private readonly noticeService: NoticeService) {
    super();
  }

  @Get('list')
  async listNotices(@Query() query: any, @Res() res: any) {
    const options = this.transferData(query, {
      must: [],
      optional: ['page', 'size'],
    });
    const result = await this.noticeService.getNoticeList({
      page: {
        pageNo: options.page ?? 1,
        pageSize: options.size ?? 10,
      },
    });
    return res
      .status(HttpStatus.OK)
      .send(this.formatResponse(HttpStatus.OK, result));
  }

  @Get(':id')
  async getNotice(@Param('id', ParseIntPipe) id: number, @Res() res: any) {
    const result = await this.noticeService.getNotice(id);
    return res
      .status(HttpStatus.OK)
      .send(this.formatResponse(HttpStatus.OK, result));
  }
}
