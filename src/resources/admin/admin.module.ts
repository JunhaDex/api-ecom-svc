import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserEntity } from '@/resources/admin/entities/admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminUserEntity])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
