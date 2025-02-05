import { BaseController } from '@/resources/base.controller';
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
  Req,
  Res,
} from '@nestjs/common';
import { ProductService } from '@/resources/product/product.service';
import { ProductCreateInput } from '@/types/admin.type';
import { StorageProvider } from '@/providers/storage.provider';

@Controller('admin/product')
export class AdminProductController extends BaseController {
  private storageProvider = new StorageProvider();

  constructor(private readonly productService: ProductService) {
    super();
  }

  @Post('new')
  async registerProduct(@Req() req: any, @Res() res: any) {
    const body = req.body;
    try {
      const newProduct = this.transferMultipart<ProductCreateInput>(body, {
        must: ['productName', 'description', 'productPrice'],
      });
      const files = await req.saveRequestFiles();
      console.log(files);
      if (files.length) {
        newProduct.imageUrls =
          await this.storageProvider.uploadProductImage(files);
      }
      console.log(newProduct);
      await this.productService.createProduct(newProduct as ProductCreateInput);
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
  async listProducts(@Query() query: any, @Res() res: any) {
    const options = this.transferData(query, {
      must: [],
      optional: ['page', 'size', 'by_id', 'by_branch'],
    });
    const result = await this.productService.getProductList({
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

  @Get(':id')
  async getProduct(@Param('id', ParseIntPipe) id: number, @Res() res: any) {
    const result = await this.productService.getProduct(id);
    return res
      .code(HttpStatus.OK)
      .send(this.formatResponse(HttpStatus.OK, result));
  }

  @Put(':id/update')
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Res() res: any,
  ) {
    try {
      const newProduct = this.transferMultipart<ProductCreateInput>(body, {
        must: ['productName', 'description', 'productPrice'],
      });
      await this.productService.updateProduct(
        id,
        newProduct as ProductCreateInput,
      );
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

  @Delete(':id/remove')
  async removeProduct(@Param('id', ParseIntPipe) id: number, @Res() res: any) {
    await this.productService.deleteProduct(id);
    return res.code(HttpStatus.OK).send(this.formatResponse(HttpStatus.OK));
  }
}
