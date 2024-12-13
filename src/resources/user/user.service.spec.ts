import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { UserEntity } from '@/resources/user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PageMeta } from '@/types/general.type';
import bcrypt from 'bcrypt';

describe('UserService', () => {
  let service: UserService;
  let adminRepo: Repository<UserEntity>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        JwtService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    adminRepo = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('should createUser', async () => {
      const newUser = {
        userId: 'user',
        pwd: '****',
        branchName: 'branch',
        branchManager: 'manager',
        branchContact: 'contact',
      };
      const expResult = {
        id: 1,
        userId: newUser.userId,
        pwd: expect.any(String),
        branchName: newUser.branchName,
        branchManager: newUser.branchManager,
        branchContact: newUser.branchContact,
        status: 1,
      } as UserEntity;
      const findOneSpy = jest
        .spyOn(adminRepo, 'findOne')
        .mockResolvedValue(null);
      const createSpy = jest
        .spyOn(adminRepo, 'create')
        .mockReturnValue(expResult);
      const saveSpy = jest
        .spyOn(adminRepo, 'save')
        .mockResolvedValue({} as any);

      await service.createUser(newUser);
      expect(findOneSpy).toBeCalledWith({ where: { userId: newUser.userId } });
      expect(createSpy).toHaveBeenCalled();
      expect(saveSpy).toHaveBeenCalled();
    });
  });

  describe('getUserList', () => {
    const userList = [
      {
        id: 1,
        userId: 'user',
        branchName: 'branch',
        branchManager: 'manager',
        branchContact: 'contact',
        status: 1,
        createdAt: new Date(),
      },
      {
        id: 2,
        userId: 'user2',
        branchName: 'branch2',
        branchManager: 'manager2',
        branchContact: 'contact2',
        status: 1,
        createdAt: new Date(),
      },
    ] as UserEntity[];
    it('shoould getUserList', async () => {
      jest
        .spyOn(adminRepo, 'findAndCount')
        .mockResolvedValue([userList, userList.length]);
      const expPgMeta = {
        pageNo: 1,
        pageSize: 10,
        totalCount: userList.length,
        totalPage: 1,
      } as PageMeta;
      const result = await service.getUserList();
      expect(result.list).toEqual(userList);
      expect(result.meta).toEqual(expPgMeta);
    });
    it('shoould getUserList with search by userId', async () => {
      const findCountSpy = jest
        .spyOn(adminRepo, 'findAndCount')
        .mockResolvedValue([[userList[1]], 1]);
      const expPgMeta = {
        pageNo: 1,
        pageSize: 10,
        totalCount: 1,
        totalPage: 1,
      } as PageMeta;
      const result = await service.getUserList({ search: { userId: 'user2' } });
      expect(findCountSpy).toBeCalledWith({
        select: [
          'id',
          'userId',
          'branchName',
          'branchManager',
          'branchContact',
          'status',
          'createdAt',
        ],
        where: { userId: 'user2' },
        take: 10,
        skip: 0,
      });
      expect(result.list).toEqual([userList[1]]);
      expect(result.meta).toEqual(expPgMeta);
    });
  });
  describe('getUser', () => {
    it('should getUser', async () => {
      const user = {
        id: 1,
        userId: 'user',
        branchName: 'branch',
        branchManager: 'manager',
        branchContact: 'contact',
        status: 1,
        createdAt: new Date(),
      } as UserEntity;
      jest.spyOn(adminRepo, 'findOne').mockResolvedValue(user);
      const result = await service.getUser(1);
      expect(result).toEqual(user);
    });
  });
  describe('loginUser', () => {
    it('should loginUser', async () => {
      const user = {
        id: 1,
        userId: 'user',
        pwd: '****',
        branchName: 'branch',
        branchManager: 'manager',
        branchContact: 'contact',
        status: 1,
        createdAt: new Date(),
      } as UserEntity;
      jest.spyOn(adminRepo, 'findOne').mockResolvedValue(user);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('token');
      const result = await service.loginUser({
        userId: 'user',
        pwd: '****',
      });
      expect(result).toEqual({ accessToken: expect.any(String) });
    });
  });
  describe('updateUserPwd', () => {
    it('should updateUserPwd', async () => {
      const user = {
        id: 1,
        userId: 'user',
        pwd: '****',
        branchName: 'branch',
        branchManager: 'manager',
        branchContact: 'contact',
        status: 1,
        createdAt: new Date(),
      } as UserEntity;
      const findSpy = jest.spyOn(adminRepo, 'findOne').mockResolvedValue(user);
      const updateSpy = jest
        .spyOn(adminRepo, 'update')
        .mockResolvedValue({} as any);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(true);
      (jest.spyOn(bcrypt, 'hash') as jest.Mock).mockResolvedValue('hashedPwd');
      await service.updateUserPwd(1, { oldPwd: 'oldPwd', newPwd: 'newPwd' });
      expect(findSpy).toBeCalledWith({ where: { id: user.id } });
      expect(updateSpy).toBeCalledWith({ id: user.id }, { pwd: 'hashedPwd' });
    });
  });
  describe('updateUserInfo', () => {
    it('should updateUserInfo', async () => {
      const user = {
        id: 1,
        userId: 'user',
        pwd: '****',
        branchName: 'branch',
        branchManager: 'manager',
        branchContact: 'contact',
        status: 1,
        createdAt: new Date(),
      } as UserEntity;
      const findSpy = jest.spyOn(adminRepo, 'findOne').mockResolvedValue(user);
      const updateSpy = jest
        .spyOn(adminRepo, 'update')
        .mockResolvedValue({} as any);
      await service.updateUserInfo(1, { branchName: 'newBranch' });
      expect(findSpy).toBeCalledWith({ where: { id: user.id } });
      expect(updateSpy).toBeCalledWith(
        { id: user.id },
        { branchName: 'newBranch' },
      );
    });
  });
  describe('deleteUser', () => {
    it('should deleteUser', async () => {
      const user = {
        id: 1,
        userId: 'user',
        pwd: '****',
        branchName: 'branch',
        branchManager: 'manager',
        branchContact: 'contact',
        status: 1,
        createdAt: new Date(),
      } as UserEntity;
      const findSpy = jest.spyOn(adminRepo, 'findOne').mockResolvedValue(user);
      const deleteSpy = jest
        .spyOn(adminRepo, 'delete')
        .mockResolvedValue({} as any);
      await service.deleteUser(1);
      expect(findSpy).toBeCalledWith({ where: { id: user.id } });
      expect(deleteSpy).toBeCalledWith({ id: user.id });
    });
  });
});
