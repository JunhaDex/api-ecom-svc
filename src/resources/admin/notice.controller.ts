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
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { BaseController } from '@/resources/base.controller';
import { NoticeService } from '@/resources/notice/notice.service';
import { NoticeCreateInput } from '@/types/admin.type';

@Controller('admin/notice')
export class NoticeController extends BaseController {
  constructor(private readonly noticeService: NoticeService) {
    super();
  }

  @Post('new')
  async registerNotice(@Body() body: any, @Res() res: any) {
    try {
      const newNotice = this.transferData<NoticeCreateInput>(body, {
        must: ['title', 'content'],
      });
      await this.noticeService.createNotice(newNotice as NoticeCreateInput);
    } catch (e) {
      Logger.error('Unhandled Error: ' + e.message);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(this.formatResponse(HttpStatus.INTERNAL_SERVER_ERROR));
    }
    return res.status(HttpStatus.OK).send(this.formatResponse(HttpStatus.OK));
  }

  @Get('list')
  async listNotices(@Query() query: any, @Res() res: any) {
    const options = this.transferData(query, {
      must: [],
      optional: ['page', 'size', 'by_title'],
    });
    const result = await this.noticeService.getNoticeList({
      page: {
        pageNo: options.page ?? 1,
        pageSize: options.size ?? 10,
      },
      search: {
        title: options.by_title,
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

  @Put(':id/update')
  async updateNotice(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Res() res: any,
  ) {
    try {
      const newNotice = this.transferData<NoticeCreateInput>(body, {
        must: ['title', 'content'],
      });
      await this.noticeService.updateNotice(id, newNotice as NoticeCreateInput);
    } catch (e) {
      Logger.error('Unhandled Error: ' + e.message);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(this.formatResponse(HttpStatus.INTERNAL_SERVER_ERROR));
    }
    return res.status(HttpStatus.OK).send(this.formatResponse(HttpStatus.OK));
  }

  @Delete(':id/remove')
  async removeNotice(@Param('id', ParseIntPipe) id: number, @Res() res: any) {
    await this.noticeService.deleteNotice(id);
    return res.status(HttpStatus.OK).send(this.formatResponse(HttpStatus.OK));
  }
}
