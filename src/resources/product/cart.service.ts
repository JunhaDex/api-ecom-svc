import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from '@/resources/product/entities/cart.entity';
import { Repository } from 'typeorm';
import { CartItem, CartItemInput } from '@/types/service.type';
import { Paginate, SvcQuery } from '@/types/general.type';
import { Product } from '@/types/admin.type';
import { count } from 'rxjs';

@Injectable()
export class CartService {
  static CART_SERVICE_EXCEPTIONS = {} as const;

  private readonly Exceptions = CartService.CART_SERVICE_EXCEPTIONS;

  constructor(
    @InjectRepository(CartEntity) private cartRepo: Repository<CartEntity>,
  ) {}

  async getUserCart(
    userId: number,
    options?: SvcQuery,
  ): Promise<Paginate<CartItem>> {
    const take = options?.page?.pageSize ?? 10;
    const skip = ((options?.page?.pageNo ?? 1) - 1) * take;
    const [list, total] = await this.cartRepo.findAndCount({
      where: { userId },
      relations: ['product'],
      take,
      skip,
    });
    return {
      list: list.map(
        (item) =>
          ({
            id: item.id,
            product: item.product as Product,
            count: item.count,
          }) as CartItem,
      ),
      meta: {
        pageNo: options?.page?.pageNo ?? 1,
        pageSize: take,
        totalCount: total,
        totalPage: Math.ceil(total / take),
      },
    };
  }

  async getCartItem(
    userId: number,
    productId: number,
  ): Promise<CartItem | null> {
    const cartItem = await this.cartRepo.findOne({
      where: { userId, productId },
    });
    if (cartItem) {
      return {
        id: cartItem.id,
        product: cartItem.product as Product,
        count: cartItem.count,
      } as CartItem;
    }
    return null;
  }

  async changeProductToCart(cartItem: CartItemInput): Promise<void> {
    const exist = await this.cartRepo.findOne({
      where: { userId: cartItem.userId, productId: cartItem.productId },
    });
    if (exist) {
      if (cartItem.count === 0) {
        await this.cartRepo.delete({
          userId: cartItem.userId,
          productId: cartItem.productId,
        });
      } else {
        exist.count = cartItem.count;
        await this.cartRepo.save(exist);
      }
    } else {
      if (cartItem.count > 0) {
        const newItem = this.cartRepo.create({
          userId: cartItem.userId,
          productId: cartItem.productId,
          count: cartItem.count,
        });
        await this.cartRepo.save(newItem);
      }
    }
  }
}
