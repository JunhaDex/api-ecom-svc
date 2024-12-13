import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@/resources/user/entities/user.entity';
import { UserGroupEntity } from '@/resources/user/entities/group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, UserGroupEntity])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
