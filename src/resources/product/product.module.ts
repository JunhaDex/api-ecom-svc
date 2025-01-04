import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ProductEntity,
  UserGroupProductEntity,
} from '@/resources/product/entities/product.entity';
import { UserService } from '@/resources/user/user.service';
import { UserEntity } from '@/resources/user/entities/user.entity';
import { GroupService } from '@/resources/user/group.service';
import { UserGroupEntity } from '@/resources/user/entities/group.entity';
import { CartService } from '@/resources/product/cart.service';
import { CartEntity } from '@/resources/product/entities/cart.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      UserEntity,
      UserGroupEntity,
      UserGroupProductEntity,
      CartEntity,
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService, UserService, GroupService, CartService],
  exports: [ProductService],
})
export class ProductModule {}
