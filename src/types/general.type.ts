export interface PageMeta {
  pageNo: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
}

export interface Paginate<T> {
  meta: PageMeta;
  list: T[];
}

export interface SvcQuery {
  page?: {
    pageNo: number;
    pageSize: number;
  };
  search?: any;
}

export interface DataTransfer<T> {
  must: (keyof T)[];
  optional?: (keyof T)[];
}

export interface LoginInput {
  userId: string;
  password: string;
}
