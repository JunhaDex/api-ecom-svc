import { GroupService } from '@/resources/user/group.service';
import { Repository } from 'typeorm';
import { UserGroupEntity } from '@/resources/user/entities/group.entity';
import { UserEntity } from '@/resources/user/entities/user.entity';
import {
  ProductEntity,
  UserGroupProductEntity,
} from '@/resources/product/entities/product.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('GroupService', () => {
  let service: GroupService;
  let groupRepo: Repository<UserGroupEntity>;
  let userRepo: Repository<UserEntity>;
  let groupProductRepo: Repository<UserGroupProductEntity>;
  let productRepo: Repository<ProductEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: getRepositoryToken(UserGroupEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserGroupProductEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<GroupService>(GroupService);
    groupRepo = module.get<Repository<UserGroupEntity>>(
      getRepositoryToken(UserGroupEntity),
    );
    userRepo = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    groupProductRepo = module.get<Repository<UserGroupProductEntity>>(
      getRepositoryToken(UserGroupProductEntity),
    );
    productRepo = module.get<Repository<ProductEntity>>(
      getRepositoryToken(ProductEntity),
    );
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('createGroup', () => {
    it('should createGroup', async () => {
      const newGroup = {
        groupName: 'group',
        description: 'description',
      };
      const findOneSpy = jest
        .spyOn(groupRepo, 'findOne')
        .mockResolvedValueOnce(null);
      const createSpy = jest
        .spyOn(groupRepo, 'create')
        .mockReturnValueOnce({} as any);
      const saveSpy = jest
        .spyOn(groupRepo, 'save')
        .mockResolvedValueOnce({} as any);
      await service.createGroup(newGroup);
      expect(findOneSpy).toBeCalledWith({
        where: { groupName: newGroup.groupName },
      });
      expect(createSpy).toBeCalled();
      expect(saveSpy).toBeCalled();
    });
  });
  describe('getGroupList', () => {});
  describe('getGroup', () => {});
  describe('updateGroup', () => {});
  describe('addGroupMember', () => {});
  describe('removeGroupMember', () => {});
  describe('addGroupProduct', () => {});
  describe('removeGroupProduct', () => {});
  describe('deleteGroup', () => {});
});
