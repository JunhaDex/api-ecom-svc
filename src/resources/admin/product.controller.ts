import { BaseController } from '@/resources/base.controller';
import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { ProductService } from '@/resources/product/product.service';
import { ProductCreateInput } from '@/types/admin.type';

@Controller('admin/product')
export class AdminProductController extends BaseController {
  constructor(private readonly productService: ProductService) {
    super();
  }

  @Post('new')
  async registerProduct(@Body() body: any, @Res() res: any) {
    try {
      const newProduct = this.transferData<ProductCreateInput>(body, {
        must: ['productName', 'description', 'productPrice'],
      });
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
}
