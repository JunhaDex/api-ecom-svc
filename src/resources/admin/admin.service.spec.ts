import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminUserEntity } from '@/resources/admin/entities/admin.entity';
import { Repository } from 'typeorm';
import { PageMeta } from '@/types/general.type';

describe('AdminService', () => {
  let service: AdminService;
  let adminRepo: Repository<AdminUserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: getRepositoryToken(AdminUserEntity),
          useValue: {
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    adminRepo = module.get<Repository<AdminUserEntity>>(
      getRepositoryToken(AdminUserEntity),
    );
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
        pwd: '****',
        name: 'admin',
        createdAt: new Date(),
      },
      {
        id: 2,
        adminId: 'admin2',
        pwd: '****',
        name: 'admin2',
        createdAt: new Date(),
      },
    ];
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
});
