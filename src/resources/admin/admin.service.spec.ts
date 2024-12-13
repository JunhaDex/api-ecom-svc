import 'dotenv/config';
import bcrypt from 'bcrypt';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminUserEntity } from '@/resources/admin/entities/admin.entity';
import { Repository } from 'typeorm';
import { PageMeta } from '@/types/general.type';
import { JwtService } from '@nestjs/jwt';

describe('AdminService', () => {
  let service: AdminService;
  let adminRepo: Repository<AdminUserEntity>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        JwtService,
        {
          provide: getRepositoryToken(AdminUserEntity),
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

    service = module.get<AdminService>(AdminService);
    adminRepo = module.get<Repository<AdminUserEntity>>(
      getRepositoryToken(AdminUserEntity),
    );
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAdmin', () => {
    it('should createAdmin', async () => {
      const newAdmin = {
        userId: 'admin',
        pwd: 'admin',
        name: 'admin',
      };
      const expResult = {
        id: 1,
        adminId: newAdmin.userId,
        pwd: expect.any(String),
        name: newAdmin.name,
        createdAt: expect.any(Date),
      } as AdminUserEntity;
      const findOneSpy = jest
        .spyOn(adminRepo, 'findOne')
        .mockResolvedValueOnce(null);
      const createSpy = jest
        .spyOn(adminRepo, 'create')
        .mockReturnValueOnce(expResult);
      const saveSpy = jest
        .spyOn(adminRepo, 'save')
        .mockResolvedValueOnce(expResult);

      await service.createAdmin(newAdmin);

      expect(findOneSpy).toBeCalledWith({
        where: { adminId: newAdmin.userId },
      });
      expect(createSpy).toHaveBeenCalled();
      const createCall = createSpy.mock.calls[0][0];
      expect(createCall.adminId).toBe(newAdmin.userId);
      expect(saveSpy).toHaveBeenCalled();
    });
  });
  describe('getAdminList', () => {
    const adminList = [
      {
        id: 1,
        adminId: 'admin',
        name: 'admin',
        createdAt: new Date(),
      },
      {
        id: 2,
        adminId: 'admin2',
        name: 'admin2',
        createdAt: new Date(),
      },
    ] as AdminUserEntity[];
    it('should getAdminList paginate', async () => {
      jest
        .spyOn(adminRepo, 'findAndCount')
        .mockResolvedValueOnce([adminList, adminList.length]);
      const expPgMeta = {
        pageNo: 1,
        pageSize: 10,
        totalCount: adminList.length,
        totalPage: 1,
      } as PageMeta;
      const result = await service.getAdminList();
      expect(result.meta).toEqual(expPgMeta);
      expect(result.list).toEqual(
        adminList.map((admin) => ({
          id: admin.id,
          adminId: admin.adminId,
          name: admin.name,
          createdAt: admin.createdAt,
        })),
      );
    });
    it('should getAdminList search by name', async () => {
      jest
        .spyOn(adminRepo, 'findAndCount')
        .mockResolvedValueOnce([[adminList[1]], 1]);
      const result = await service.getAdminList({ search: { name: 'admin2' } });
      expect(result.meta.totalCount).toBe(1);
      expect(result.list[0]).toEqual({
        id: adminList[1].id,
        adminId: adminList[1].adminId,
        name: adminList[1].name,
        createdAt: adminList[1].createdAt,
      });
    });
  });
  describe('getAdmin', () => {
    it('should getAdmin', async () => {
      const admin = {
        id: 1,
        adminId: 'admin',
        pwd: '****',
        name: 'admin',
        createdAt: new Date(),
      };
      jest.spyOn(adminRepo, 'findOne').mockResolvedValueOnce(admin);
      const result = await service.getAdmin(1);
      expect(result).toEqual({
        id: admin.id,
        adminId: admin.adminId,
        name: admin.name,
        createdAt: admin.createdAt,
      });
    });
  });

  describe('loginAdmin', () => {
    it('should loginAdmin', async () => {
      const admin = {
        id: 1,
        adminId: 'admin',
        pwd: '****',
        name: 'admin',
        createdAt: new Date(),
      };
      jest.spyOn(adminRepo, 'findOne').mockResolvedValueOnce(admin);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValueOnce(true);
      jest.spyOn(jwtService, 'sign').mockReturnValueOnce('token');
      const result = await service.loginAdmin({
        userId: admin.adminId,
        pwd: admin.pwd,
      });
      expect(result).toEqual({ accessToken: expect.any(String) });
    });
  });

  describe('updateAdminPwd', () => {
    it('should updateAdminPwd', async () => {
      const admin = {
        id: 1,
        adminId: 'admin',
        pwd: '****',
        name: 'admin',
        createdAt: new Date(),
      };
      const findSpy = jest
        .spyOn(adminRepo, 'findOne')
        .mockResolvedValueOnce(admin);
      const updateSpy = jest
        .spyOn(adminRepo, 'update')
        .mockResolvedValueOnce({} as any);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValueOnce(true);
      (jest.spyOn(bcrypt, 'hash') as jest.Mock).mockResolvedValueOnce(
        'somewhat',
      );
      await service.updateAdminPwd(admin.id, {
        oldPwd: '****',
        newPwd: 'somewhat',
      });
      expect(findSpy).toBeCalledWith({ where: { id: admin.id } });
      expect(updateSpy).toBeCalledWith(
        { id: admin.id },
        { pwd: expect.any(String) },
      );
    });
  });
  describe('updateAdminInfo', () => {
    it('should updateAdminInfo', async () => {
      const admin = {
        id: 1,
        adminId: 'admin',
        pwd: '****',
        name: 'admin',
        createdAt: new Date(),
      };
      const findSpy = jest
        .spyOn(adminRepo, 'findOne')
        .mockResolvedValueOnce(admin);
      const updateSpy = jest
        .spyOn(adminRepo, 'update')
        .mockResolvedValueOnce({} as any);
      await service.updateAdminInfo(admin.id, { name: 'new name' });
      expect(findSpy).toBeCalledWith({ where: { id: admin.id } });
      expect(updateSpy).toBeCalledWith({ id: admin.id }, { name: 'new name' });
    });
  });
  describe('deleteAdmin', () => {
    it('should deleteAdmin', async () => {
      const admin = {
        id: 1,
        adminId: 'admin',
        pwd: '****',
        name: 'admin',
        createdAt: new Date(),
      };
      const findSpy = jest
        .spyOn(adminRepo, 'findOne')
        .mockResolvedValueOnce(admin);
      const deleteSpy = jest
        .spyOn(adminRepo, 'delete')
        .mockResolvedValueOnce({} as any);
      await service.deleteAdmin(admin.id);
      expect(findSpy).toBeCalledWith({ where: { id: admin.id } });
      expect(deleteSpy).toBeCalledWith({ id: admin.id });
    });
  });
});
