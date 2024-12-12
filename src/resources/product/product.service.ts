import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductService {
  async createProduct(): Promise<void> {}

  async getProductList() {}

  async getProduct() {}

  async updateProduct() {}

  async deleteProduct() {}
}
