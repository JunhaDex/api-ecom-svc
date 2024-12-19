import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CourierEntity } from '@/resources/shipment/entities/courier.entity';
import { Repository } from 'typeorm';
import {
  Courier,
  CourierCreateInput,
  CourierUpdateInput,
} from '@/types/admin.type';
import { Paginate, SvcQuery } from '@/types/general.type';

@Injectable()
export class CourierService {
  static COURIER_SERVICE_EXCEPTIONS = {
    COURIER_NOT_FOUND: 'COURIER_NOT_FOUND',
  } as const;

  private readonly Exceptions = CourierService.COURIER_SERVICE_EXCEPTIONS;

  constructor(
    @InjectRepository(CourierEntity)
    private courierRepo: Repository<CourierEntity>,
  ) {}

  async createCourier(newCourier: CourierCreateInput): Promise<void> {
    const courier = this.courierRepo.create({
      courierName: newCourier.courierName,
      apiUrl: newCourier.apiUrl,
    });
    await this.courierRepo.save(courier);
  }

  async getCourierList(options?: SvcQuery): Promise<Paginate<Courier>> {
    const searchOptions = ['courierName'];
    const take = options?.page?.pageSize ?? 10;
    const skip = ((options?.page?.pageNo ?? 1) - 1) * take;
    let whereClause: { (key: string): any } = undefined;
    if (options?.search) {
      whereClause = Object.keys(options.search).reduce((acc, key) => {
        if (searchOptions.includes(key)) {
          acc[key] = options.search[key];
        }
        return acc;
      }, {} as any);
    }
    const [list, total] = await this.courierRepo.findAndCount({
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

  async updateCourier(
    index: number,
    params: CourierUpdateInput,
  ): Promise<void> {
    const courier = await this.courierRepo.findOne({ where: { id: index } });
    if (courier) {
      courier.courierName = params.courierName;
      courier.apiUrl = params.apiUrl;
      await this.courierRepo.save(courier);
      return;
    }
    throw new Error(this.Exceptions.COURIER_NOT_FOUND);
  }

  async deleteCourier(index: number): Promise<void> {
    const courier = await this.courierRepo.findOne({ where: { id: index } });
    if (courier) {
      await this.courierRepo.delete(courier);
      return;
    }
    throw new Error(this.Exceptions.COURIER_NOT_FOUND);
  }
}
