import { Test, TestingModule } from '@nestjs/testing';
import { CourierService } from '@/resources/shipment/courier.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourierEntity } from '@/resources/shipment/entities/courier.entity';
import { Repository } from 'typeorm';

describe('CourierService', () => {
  let service: CourierService;
  let courierRepo: Repository<CourierEntity>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourierService,
        {
          provide: getRepositoryToken(CourierEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();
    service = module.get<CourierService>(CourierService);
    courierRepo = module.get<Repository<CourierEntity>>(
      getRepositoryToken(CourierEntity),
    );
  });

  describe('createCourier', () => {
    it('should create a new courier', async () => {
      const newCourier = {
        id: 1,
        courierName: 'testCourier',
        apiUrl: 'testApiUrl',
        createdAt: new Date(),
      };
      const createSpy = jest
        .spyOn(courierRepo, 'create')
        .mockReturnValueOnce(newCourier as any);
      const saveSpy = jest
        .spyOn(courierRepo, 'save')
        .mockResolvedValueOnce({} as any);
      await service.createCourier(newCourier);
      expect(createSpy).toBeCalledWith({
        courierName: newCourier.courierName,
        apiUrl: newCourier.apiUrl,
      });
      expect(saveSpy).toBeCalled();
    });
  });
  describe('getCourierList', () => {
    it('should get a list of couriers', async () => {
      const options = {
        page: {
          pageNo: 1,
          pageSize: 10,
        },
        search: {
          courierName: 'testCourier',
        },
      };
      const findAndCountSpy = jest
        .spyOn(courierRepo, 'findAndCount')
        .mockResolvedValueOnce([[], 0] as any);
      await service.getCourierList(options);
      expect(findAndCountSpy).toBeCalledWith({
        where: { courierName: 'testCourier' },
        take: 10,
        skip: 0,
      });
    });
  });

  describe('updateCourier', () => {
    it('should update a courier', async () => {
      const index = 1;
      const params = {
        courierName: 'editedCourier',
      };
      const courier = {
        id: 1,
        courierName: 'testCourier',
        apiUrl: 'testApiUrl',
        createdAt: new Date(),
      };
      const findOneSpy = jest
        .spyOn(courierRepo, 'findOne')
        .mockResolvedValue(courier as any);
      const saveSpy = jest
        .spyOn(courierRepo, 'save')
        .mockResolvedValueOnce({} as any);
      await service.updateCourier(index, params);
      expect(findOneSpy).toBeCalledWith({ where: { id: index } });
      expect(saveSpy).toBeCalled();
    });
  });

  describe('deleteCourier', () => {
    it('should delete a courier', async () => {
      const index = 1;
      const courier = {
        id: 1,
        courierName: 'testCourier',
        apiUrl: 'testApiUrl',
        createdAt: new Date(),
      };
      const findOneSpy = jest
        .spyOn(courierRepo, 'findOne')
        .mockResolvedValue(courier as any);
      const deleteSpy = jest
        .spyOn(courierRepo, 'delete')
        .mockResolvedValue({} as any);
      await service.deleteCourier(index);
      expect(findOneSpy).toBeCalledWith({ where: { id: index } });
      expect(deleteSpy).toBeCalled();
    });
  });
});
