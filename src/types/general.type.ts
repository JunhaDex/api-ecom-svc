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
