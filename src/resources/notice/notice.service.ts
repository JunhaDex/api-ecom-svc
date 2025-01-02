import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { NoticeEntity } from '@/resources/notice/entities/notice.entity';
import { Notice, NoticeCreateInput } from '@/types/admin.type';
import { Paginate, SvcQuery } from '@/types/general.type';

@Injectable()
export class NoticeService {
  static NOTICE_SERVICE_EXCEPTIONS = {
    NOTICE_NOT_FOUND: 'NOTICE_NOT_FOUND',
  } as const;
  private readonly Exceptions = NoticeService.NOTICE_SERVICE_EXCEPTIONS;

  constructor(
    @InjectRepository(NoticeEntity) private notiRepo: Repository<NoticeEntity>,
  ) {}

  async createNotice(newNotice: NoticeCreateInput): Promise<void> {
    const notice = this.notiRepo.create({
      title: newNotice.title,
      content: newNotice.content,
    });
    await this.notiRepo.save(notice);
    return;
  }

  async getNoticeList(options?: SvcQuery): Promise<Paginate<Notice>> {
    const searchOptions = ['title'];
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
    const [list, total] = await this.notiRepo.findAndCount({
      where: whereClause as any,
      take,
      skip,
      order: { createdAt: 'DESC' },
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

  async getNotice(index: number): Promise<Notice> {
    const notice = await this.notiRepo.findOne({ where: { id: index } });
    if (notice) {
      return notice;
    }
    throw new Error(this.Exceptions.NOTICE_NOT_FOUND);
  }

  async updateNotice(
    index: number,
    newNotice: NoticeCreateInput,
  ): Promise<void> {
    const notice = await this.notiRepo.findOne({ where: { id: index } });
    if (notice) {
      notice.title = newNotice.title;
      notice.content = newNotice.content;
      await this.notiRepo.save(notice);
      return;
    }
    throw new Error(this.Exceptions.NOTICE_NOT_FOUND);
  }

  async deleteNotice(index: number): Promise<void> {
    await this.notiRepo.delete({ id: index });
    return;
  }
}
