import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/resources/user/entities/user.entity';
import { UserGroupEntity } from '@/resources/user/entities/group.entity';
import { GroupService } from '@/resources/user/group.service';
import {
  ProductEntity,
  UserGroupProductEntity,
} from '@/resources/product/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      UserGroupEntity,
      UserGroupProductEntity,
      ProductEntity,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, GroupService],
  exports: [UserService, GroupService],
})
export class UserModule {}
