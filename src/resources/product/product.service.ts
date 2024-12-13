import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductService {
  async createProduct(): Promise<void> {}

  async getProductList() {}

  async getProductByGroup() {}

  async getProduct() {}

  async updateProduct() {}

  async deleteProduct() {}
}
