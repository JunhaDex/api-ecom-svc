import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserEntity } from '@/resources/admin/entities/admin.entity';
import { AdminProductController } from '@/resources/admin/product.controller';
import { ProductService } from '@/resources/product/product.service';
import {
  ProductEntity,
  UserGroupProductEntity,
} from '@/resources/product/entities/product.entity';
import { AdminUserController } from '@/resources/admin/user.controller';
import { UserService } from '@/resources/user/user.service';
import { UserEntity } from '@/resources/user/entities/user.entity';
import { GroupService } from '@/resources/user/group.service';
import { UserGroupEntity } from '@/resources/user/entities/group.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminUserEntity,
      UserEntity,
      ProductEntity,
      UserGroupEntity,
      UserGroupProductEntity,
    ]),
  ],
  controllers: [AdminController, AdminProductController, AdminUserController],
  providers: [AdminService, ProductService, UserService, GroupService],
})
export class AdminModule {}
