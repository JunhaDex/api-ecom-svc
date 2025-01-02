import {
  Controller,
  Get,
  HttpStatus,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { BaseController } from '@/resources/base.controller';
import { UserGuard } from '@/guards/user.guard';
import { GroupService } from '@/resources/user/group.service';

@Controller('product')
export class ProductController extends BaseController {
  constructor(
    private readonly productService: ProductService,
    private readonly groupService: GroupService,
  ) {
    super();
  }

  @Get('list')
  @UseGuards(UserGuard)
  async listProduct(@Query() query: any, @Req() req: any, @Res() res: any) {
    const options = this.transferData(query, {
      must: [],
      optional: ['page', 'size'],
    });
    const groupId = req.user.groupId ?? 0;
    const result = await this.groupService.getGroupProductList(groupId, {
      page: {
        pageNo: options.page ?? 1,
        pageSize: options.size ?? 10,
      },
    });
    return res
      .code(HttpStatus.OK)
      .send(this.formatResponse(HttpStatus.OK, result));
  }
}
