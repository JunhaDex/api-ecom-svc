import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { BaseController } from '@/resources/base.controller';
import { UserGuard } from '@/guards/user.guard';
import { GroupService } from '@/resources/user/group.service';
import { CartService } from '@/resources/product/cart.service';

@Controller('product')
export class ProductController extends BaseController {
  constructor(
    private readonly productService: ProductService,
    private readonly groupService: GroupService,
    private readonly cartService: CartService,
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

  @Get('cart')
  @UseGuards(UserGuard)
  async listCart(@Query() query: any, @Req() req: any, @Res() res: any) {
    const options = this.transferData(query, {
      must: [],
      optional: ['page', 'size'],
    });
    const result = await this.cartService.getUserCart(req.user.id, options);
    return res
      .code(HttpStatus.OK)
      .send(this.formatResponse(HttpStatus.OK, result));
  }

  @Get(':id')
  @UseGuards(UserGuard)
  async getProduct(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Res() res: any,
  ) {
    const userGroup = req.user.groupId ?? 0;
    try {
      const isAllowed = await this.groupService.checkGroupProductAccess(
        userGroup,
        id,
      );
      if (isAllowed) {
        const result = await this.productService.getProduct(id);
        return res
          .code(HttpStatus.OK)
          .send(this.formatResponse(HttpStatus.OK, result));
      }
    } catch (e) {
      Logger.error('Unhandled Error: ' + e.message);
      if (
        e.message === GroupService.GROUP_SERVICE_EXCEPTIONS.GROUP_ACCESS_DENIED
      ) {
        return res
          .code(HttpStatus.FORBIDDEN)
          .send(this.formatResponse(HttpStatus.FORBIDDEN));
      }
      return res
        .code(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(this.formatResponse(HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  @Get('many')
  async getProducts(@Query() query: any, @Res() res: any) {
    const url = new URLSearchParams(query);
    const idsParam = url.getAll('ids[]')[0];
    const idList = idsParam.split(',').map((id) => parseInt(id));
    const list = await this.productService.getManyProducts(idList);
    return res
      .code(HttpStatus.OK)
      .send(this.formatResponse(HttpStatus.OK, list));
  }

  @Get('cart/:id')
  @UseGuards(UserGuard)
  async getCart(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Res() res: any,
  ) {
    try {
      const result = await this.cartService.getCartItem(req.user.id, id);
      return res
        .code(HttpStatus.OK)
        .send(this.formatResponse(HttpStatus.OK, result));
    } catch (e) {
      Logger.error('Unhandled Error: ' + e.message);
      return res
        .code(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(this.formatResponse(HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  @Put('cart')
  @UseGuards(UserGuard)
  async addProductToCart(@Body() body: any, @Req() req: any, @Res() res: any) {
    try {
      const cleaned = this.transferData(body, {
        must: ['count', 'productId'],
      });
      const user = req.user;
      await this.cartService.changeProductToCart({
        userId: user.id,
        productId: cleaned.productId,
        count: cleaned.count,
      });
      return res.code(HttpStatus.OK).send(this.formatResponse(HttpStatus.OK));
    } catch (e) {
      if (e.message === this.CONTROLLER_EXCEPTIONS.DATA_TRANSFER_INVALID) {
        return res
          .code(HttpStatus.BAD_REQUEST)
          .send(this.formatResponse(HttpStatus.BAD_REQUEST));
      }
      Logger.error('Unhandled Error: ' + e.message);
      return res
        .code(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(this.formatResponse(HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }

  @Post('cart/clear')
  @UseGuards(UserGuard)
  async clearCart(@Body() body: any, @Req() req: any, @Res() res: any) {
    try {
      const payload = this.transferData(body, {
        must: ['productIds'],
      });
      await this.cartService.deleteCartItem(req.user.id, payload.productIds);
    } catch (e) {
      if (e.message === this.CONTROLLER_EXCEPTIONS.DATA_TRANSFER_INVALID) {
        return res
          .code(HttpStatus.BAD_REQUEST)
          .send(this.formatResponse(HttpStatus.BAD_REQUEST));
      }
      Logger.error('Unhandled Error: ' + e.message);
      return res
        .code(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(this.formatResponse(HttpStatus.INTERNAL_SERVER_ERROR));
    }
  }
}
