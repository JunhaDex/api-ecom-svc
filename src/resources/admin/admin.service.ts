import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminCreateInput, AdminUser } from '@/types/admin.type';
import { InjectRepository } from '@nestjs/typeorm';
import { AdminUserEntity } from '@/resources/admin/entities/admin.entity';
import { Paginate, SvcQuery } from '@/types/general.type';

@Injectable()
export class AdminService {
  static ADMIN_SERVICE_EXCEPTIONS = {
    ADMIN_EXISTS: 'ADMIN_EXISTS',
    ADMIN_NOT_FOUND: 'ADMIN_NOT_FOUND',
  } as const;

  private readonly Exceptions = AdminService.ADMIN_SERVICE_EXCEPTIONS;

  constructor(
    private jwtService: JwtService,
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
      });
      console.log('admin', pass);
      await this.adminRepo.save(admin);
    }
    throw new Error(this.Exceptions.ADMIN_EXISTS);
  }

  async getAdminList(options?: SvcQuery): Promise<Paginate<AdminUser>> {
    const searchOptions = ['adminId', 'name'];
    const take = options?.page?.pageSize ?? 10;
    const skip = ((options?.page?.pageNo ?? 1) - 1) * take;
    console.log('skip', options?.page?.pageNo ?? 1 - 1);
    let whereClause: { (key: string): any } = undefined;
    if (options?.search) {
      whereClause = Object.keys(options.search).reduce((acc, key) => {
        if (searchOptions.includes(key)) {
          acc[key] = options.search[key];
        }
        return acc;
      }, {} as any);
    }
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
      list,
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

  async loginAdmin(params: {
    userId: string;
    pwd: string;
  }): Promise<{ accessToken: string }> {
    const admin = await this.adminRepo.findOne({
      where: { adminId: params.userId },
    });
    if (admin) {
      if (await bcrypt.compare(params.pwd, admin.pwd)) {
        const payload = {
          adminId: admin.adminId,
          name: admin.name,
          sub: admin.id,
        };
        return {
          accessToken: this.jwtService.sign(payload, { expiresIn: '1d' }),
        };
      }
    }
    throw new Error(this.Exceptions.ADMIN_NOT_FOUND);
  }

  async updateAdminPwd(
    index: number,
    params: {
      oldPwd: string;
      newPwd: string;
    },
  ): Promise<void> {
    const admin = await this.adminRepo.findOne({ where: { id: index } });
    if (admin) {
      if (await bcrypt.compare(params.oldPwd, admin.pwd)) {
        const rnd = Number(process.env.BC_SALT_RND);
        const salt = await bcrypt.genSalt(rnd);
        const pass = await bcrypt.hash(params.newPwd, salt);
        console.log('pass', salt);
        await this.adminRepo.update({ id: index }, { pwd: pass });
      }
      return;
    }
    throw new Error(this.Exceptions.ADMIN_NOT_FOUND);
  }

  async updateAdminInfo(
    index: number,
    params: { name?: string },
  ): Promise<void> {
    const admin = await this.adminRepo.findOne({ where: { id: index } });
    if (admin) {
      await this.adminRepo.update({ id: index }, params);
      return;
    }
    throw new Error(this.Exceptions.ADMIN_NOT_FOUND);
  }

  async deleteAdmin(index: number): Promise<void> {
    const admin = await this.adminRepo.findOne({ where: { id: index } });
    if (admin) {
      await this.adminRepo.delete({ id: index });
      return;
    }
    throw new Error(this.Exceptions.ADMIN_NOT_FOUND);
  }
}
