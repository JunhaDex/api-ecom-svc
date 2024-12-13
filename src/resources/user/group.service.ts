import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserGroupEntity } from '@/resources/user/entities/group.entity';
import { In, Repository } from 'typeorm';
import {
  Product,
  User,
  UserGroup,
  UserGroupCreateInput,
  UserGroupUpdateInput,
} from '@/types/admin.type';
import { Paginate, SvcQuery } from '@/types/general.type';
import { UserEntity } from '@/resources/user/entities/user.entity';
import {
  ProductEntity,
  UserGroupProductEntity,
} from '@/resources/product/entities/product.entity';

@Injectable()
export class GroupService {
  static GROUP_SERVICE_EXCEPTIONS = {
    GROUP_EXISTS: 'GROUP_EXISTS',
    GROUP_NOT_FOUND: 'GROUP_NOT_FOUND',
    GROUP_UNAVAILABLE: 'GROUP_UNAVAILABLE',
  } as const;
  private readonly Exceptions = GroupService.GROUP_SERVICE_EXCEPTIONS;

  constructor(
    @InjectRepository(UserGroupEntity)
    private groupRepo: Repository<UserGroupEntity>,
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(UserGroupProductEntity)
    private groupProductRepo: Repository<UserGroupProductEntity>,
    @InjectRepository(ProductEntity)
    private productRepo: Repository<ProductEntity>,
  ) {}

  async createGroup(newGroup: UserGroupCreateInput): Promise<void> {
    const duplicate = await this.groupRepo.findOne({
      where: {
        groupName: newGroup.groupName,
      },
    });
    if (!duplicate) {
      const group = this.groupRepo.create({
        groupName: newGroup.groupName,
        description: newGroup.description,
      });
      await this.groupRepo.save(group);
      return;
    }
    throw new Error(this.Exceptions.GROUP_EXISTS);
  }

  async getGroupList(options?: SvcQuery): Promise<Paginate<UserGroup>> {
    const searchOptions = ['groupName'];
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
    const [list, total] = await this.groupRepo.findAndCount({
      where: whereClause as any,
      relations: ['users', 'products'],
      take,
      skip,
    });
    return {
      list: list.map((group) => ({
        id: group.id,
        groupName: group.groupName,
        description: group.description,
        createdAt: group.createdAt,
        usersCount: group.users.length,
        productsCount: group.products.length,
      })),
      meta: {
        pageNo: options?.page?.pageNo ?? 1,
        pageSize: options?.page?.pageSize ?? 10,
        totalCount: total,
        totalPage: Math.ceil(total / take),
      },
    };
  }

  async getGroup(index: number) {
    const group = await this.groupRepo.findOne({
      where: { id: index },
      relations: ['users', 'products'],
    });
    if (group) {
      return group;
    }
    throw new Error(this.Exceptions.GROUP_NOT_FOUND);
  }

  async updateGroup(index: number, params: UserGroupUpdateInput) {
    const group = await this.groupRepo.findOne({
      where: { id: index },
    });
    if (group) {
      const updatedGroup = this.groupRepo.create({
        ...group,
        ...params,
      });
      await this.groupRepo.update({ id: index }, updatedGroup);
      return;
    }
    throw new Error(this.Exceptions.GROUP_NOT_FOUND);
  }

  async addGroupMember(index: number, users: User[]) {
    const group = await this.groupRepo.findOne({
      where: { id: index },
      relations: ['users'],
    });
    if (group) {
      const exUsers = await this.userRepo.find({
        where: { id: In(users.map((user) => user.id)) },
      });
      group.users = [...group.users, ...exUsers];
      await this.groupRepo.save(group);
      return;
    }
    throw new Error(this.Exceptions.GROUP_NOT_FOUND);
  }

  async removeGroupMember(index: number, users: User[]) {
    const group = await this.groupRepo.findOne({
      where: { id: index },
      relations: ['users'],
    });
    if (group) {
      await this.userRepo.update(
        { id: In(users.map((user) => user.id)) },
        { userGroup: null },
      );
      return;
    }
    throw new Error(this.Exceptions.GROUP_NOT_FOUND);
  }

  async addGroupProduct(index: number, products: Product[]) {
    const group = await this.groupRepo.findOne({
      where: { id: index },
      relations: ['products'],
    });
    if (group) {
      const availables = await this.productRepo
        .createQueryBuilder('product')
        .leftJoin(
          UserGroupProductEntity,
          'ugp',
          'ugp.productId = product.id AND ugp.groupId = :groupId',
          { groupId: index },
        )
        .select(['product.id', 'product.name', 'ugp.groupId'])
        .where('product.id IN (:...productIds)', {
          productIds: products.map((product) => product.id),
        })
        .andWhere('ugp.groupId IS NULL')
        .getMany();
      const newProducts = availables.map((product) =>
        this.groupProductRepo.create({
          userGroupId: index,
          productId: product.id,
        }),
      );
      await this.groupProductRepo.save(newProducts);
      return;
    }
    throw new Error(this.Exceptions.GROUP_NOT_FOUND);
  }

  async removeGroupProduct(index: number, products: Product[]) {
    const group = await this.groupRepo.findOne({
      where: { id: index },
      relations: ['products'],
    });
    if (group) {
      const exists = await this.groupProductRepo.find({
        where: {
          userGroupId: index,
          productId: In(products.map((product) => product.id)),
        },
      });
      await this.groupProductRepo.remove(exists);
      return;
    }
    throw new Error(this.Exceptions.GROUP_NOT_FOUND);
  }

  async deleteGroup(index: number) {
    const group = await this.groupRepo.findOne({
      where: { id: index },
    });
    if (group) {
      const belongs = await this.userRepo.findOne({
        where: { userGroup: group },
      });
      if (!belongs) {
        await this.groupRepo.manager.transaction(async (manager) => {
          await manager.delete(UserGroupProductEntity, { userGroupId: index });
          await manager.delete(UserGroupEntity, { id: index });
        });
        return;
      }
      throw new Error(this.Exceptions.GROUP_UNAVAILABLE);
    }
    throw new Error(this.Exceptions.GROUP_NOT_FOUND);
  }
}
