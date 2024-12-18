import { Injectable } from '@nestjs/common';
import {
  Product,
  ProductCreateInput,
  ProductUpdateInput,
} from '@/types/admin.type';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '@/resources/product/entities/product.entity';
import { Repository } from 'typeorm';
import { Paginate, SvcQuery } from '@/types/general.type';

@Injectable()
export class ProductService {
  static PRODUCT_SERVICE_EXCEPTIONS = {
    PRODUCT_NOT_FOUND: 'PRODUCT_NOT_FOUND',
  } as const;
  private readonly Exceptions = ProductService.PRODUCT_SERVICE_EXCEPTIONS;

  constructor(
    @InjectRepository(ProductEntity)
    private productRepo: Repository<ProductEntity>,
  ) {}

  async createProduct(newProduct: ProductCreateInput): Promise<void> {
    const product = this.productRepo.create({
      productName: newProduct.productName,
      description: newProduct.description,
      imageUrls: newProduct.imageUrls,
      productPrice: newProduct.productPrice,
      status: 1,
    });
    await this.productRepo.save(product);
    return;
  }

  async getProductList(options?: SvcQuery): Promise<Paginate<Product>> {
    const searchOptions = ['productName', 'groupId'];
    const take = options?.page?.pageSize ?? 10;
    const skip = ((options?.page?.pageNo ?? 1) - 1) * take;
    let whereClause: { (key: string): any } = undefined;
    if (options?.search) {
      whereClause = Object.keys(options.search).reduce((acc, key) => {
        if (searchOptions.includes(key)) {
          acc[key] = options.search[key];
        }
        return acc;
      }, {} as any);
    }
    const [list, total] = await this.productRepo.findAndCount({
      select: ['id', 'productName', 'description', 'productPrice', 'status'],
      where: whereClause as any,
      take,
      skip,
    });
    return {
      list,
      meta: {
        pageNo: options?.page?.pageNo ?? 1,
        pageSize: take,
        totalCount: total,
        totalPage: Math.ceil(total / take),
      },
    };
  }

  async getProduct(index: number) {
    const product = await this.productRepo.findOne({ where: { id: index } });
    if (product) {
      return product;
    }
    throw new Error(this.Exceptions.PRODUCT_NOT_FOUND);
  }

  async updateProduct(
    index: number,
    params: ProductUpdateInput,
  ): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id: index } });
    if (product) {
      await this.productRepo.save({
        ...product,
        ...params,
      });
      return;
    }
    throw new Error(this.Exceptions.PRODUCT_NOT_FOUND);
  }

  async deleteProduct(index: number): Promise<void> {
    const product = await this.productRepo.findOne({ where: { id: index } });
    if (product) {
      await this.productRepo.delete({ id: index });
      return;
    }
  }
}
