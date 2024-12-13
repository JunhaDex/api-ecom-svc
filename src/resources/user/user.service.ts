import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@/resources/user/entities/user.entity';
import { Repository } from 'typeorm';
import {
  User,
  UserCreateInput,
  UserGroup,
  UserUpdateInput,
} from '@/types/admin.type';
import { Paginate, SvcQuery } from '@/types/general.type';

@Injectable()
export class UserService {
  static USER_SERVICE_EXCEPTIONS = {
    USER_EXISTS: 'USER_EXISTS',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
  } as const;

  private readonly Exceptions = UserService.USER_SERVICE_EXCEPTIONS;

  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {}

  async createUser(newUser: UserCreateInput): Promise<void> {
    const duplicate = await this.userRepo.findOne({
      where: {
        userId: newUser.userId,
      },
    });
    if (!duplicate) {
      const rnd = Number(process.env.BC_SALT_RND);
      const salt = await bcrypt.genSalt(rnd);
      const pass = await bcrypt.hash(newUser.pwd, salt);
      const user = this.userRepo.create({
        userId: newUser.userId,
        pwd: pass,
        branchName: newUser.branchName,
        branchManager: newUser.branchManager,
        branchContact: newUser.branchContact,
        status: 1,
      });
      await this.userRepo.save(user);
      return;
    }
    throw new Error(this.Exceptions.USER_EXISTS);
  }

  async getUserList(options?: SvcQuery): Promise<Paginate<User>> {
    const searchOptions = ['userId', 'branchName'];
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
    const [list, total] = await this.userRepo.findAndCount({
      select: [
        'id',
        'userId',
        'branchName',
        'branchManager',
        'branchContact',
        'status',
        'createdAt',
      ],
      where: whereClause as any,
      take,
      skip,
    });
    return {
      list,
      meta: {
        pageNo: options?.page?.pageNo ?? 1,
        pageSize: take,
        totalCount: total,
        totalPage: Math.ceil(total / take),
      },
    };
  }

  async getUser(index: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: index },
      relations: ['userGroup'],
    });
    if (user) {
      return {
        id: user.id,
        userId: user.userId,
        branchName: user.branchName,
        branchManager: user.branchManager,
        branchContact: user.branchContact,
        status: user.status,
        createdAt: user.createdAt,
        userGroup: user.userGroup as UserGroup,
      } as User;
    }
    throw new Error(this.Exceptions.USER_NOT_FOUND);
  }

  async loginUser(params: { userId: string; pwd: string }) {
    const user = await this.userRepo.findOne({
      where: { userId: params.userId },
    });
    if (user) {
      if (await bcrypt.compare(params.pwd, user.pwd)) {
        const payload = {
          userId: user.userId,
          sub: user.id,
        };
        return {
          accessToken: this.jwtService.sign(payload, { expiresIn: '1d' }),
        };
      }
    }
    throw new Error(this.Exceptions.USER_NOT_FOUND);
  }

  async updateUserPwd(
    index: number,
    params: { oldPwd: string; newPwd: string },
  ): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: index } });
    if (user) {
      if (await bcrypt.compare(params.oldPwd, user.pwd)) {
        const rnd = Number(process.env.BC_SALT_RND);
        const salt = await bcrypt.genSalt(rnd);
        const pass = await bcrypt.hash(params.newPwd, salt);
        await this.userRepo.update({ id: index }, { pwd: pass });
        return;
      }
    }
    throw new Error(this.Exceptions.USER_NOT_FOUND);
  }

  async updateUserInfo(index: number, params: UserUpdateInput): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: index } });
    if (user) {
      await this.userRepo.update({ id: index }, params);
      return;
    }
    throw new Error(this.Exceptions.USER_NOT_FOUND);
  }

  async deleteUser(index: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { id: index } });
    if (user) {
      await this.userRepo.delete({ id: index });
      return;
    }
    throw new Error(this.Exceptions.USER_NOT_FOUND);
  }
}
