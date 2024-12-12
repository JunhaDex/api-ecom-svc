import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { AdminCreateInput, AdminUser } from '@/types/admin.type';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUserEntity } from '@/resources/admin/entities/admin.entity';
import { Paginate, SvcQuery } from '@/types/general.type';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(AdminUserEntity)
    private adminRepo: Repository<AdminUserEntity>,
  ) {}

  async createAdmin(newAdmin: AdminCreateInput): Promise<void> {
    const duplicate = await this.adminRepo.findOne({
      where: {
        adminId: newAdmin.userId,
      },
    });
    if (!duplicate) {
      const rnd = Number(process.env.BC_SALT_RND);
      const salt = await bcrypt.genSalt(rnd);
      const pass = await bcrypt.hash(newAdmin.pwd, salt);
      const admin = this.adminRepo.create({
        adminId: newAdmin.userId,
        pwd: pass,
        name: newAdmin.name,
        createdAt: new Date(),
      });
      await this.adminRepo.save(admin);
    }
  }

  async getAdminList(options?: SvcQuery): Promise<Paginate<AdminUser>> {
    const searchOptions = ['adminId', 'name'];
    const take = options?.page?.pageSize ?? 10;
    const skip = (options?.page?.pageNo ?? 1 - 1) * take;
    let whereClause: { (key: string): any } = undefined;
    if (options?.search) {
      whereClause = Object.keys(options.search).reduce((acc, key) => {
        if (searchOptions.includes(key)) {
          acc[key] = options.search[key];
        }
        return acc;
      }, {} as any);
    }
    console.log(whereClause);
    const [list, total] = await this.adminRepo.findAndCount({
      select: ['id', 'adminId', 'name', 'createdAt'],
      where: whereClause as any,
      order: {
        id: 'DESC',
      },
      take,
      skip,
    });
    return {
      list: list.map((admin) => ({
        id: admin.id,
        adminId: admin.adminId,
        name: admin.name,
        createdAt: admin.createdAt,
      })),
      meta: {
        pageNo: options?.page?.pageNo ?? 1,
        pageSize: options?.page?.pageSize ?? 10,
        totalCount: total,
        totalPage: Math.ceil(total / take),
      },
    };
  }

  async getAdmin(index: number): Promise<AdminUser> {
    const admin = await this.adminRepo.findOne({ where: { id: index } });
    return {
      id: admin.id,
      adminId: admin.adminId,
      name: admin.name,
      createdAt: admin.createdAt,
    } as AdminUser;
  }

  async loginAdmin(params: { userId: string; password: string }) {

  }

  async updateAdminPwd(
    index: number,
    params: {
      oldPwd: string;
      newPwd: string;
    },
  ) {}

  async updateAdminInfo() {}

  async deleteAdmin() {}
}
