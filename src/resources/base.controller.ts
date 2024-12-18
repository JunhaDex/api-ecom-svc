import { DataTransfer } from '@/types/general.type';

export abstract class BaseController {
  protected readonly CONTROLLER_EXCEPTIONS = {
    DATA_TRANSFER_INVALID: 'DATA_TRANSFER_INVALID',
  } as const;

  protected transferData<T extends object>(
    raw: any,
    keys: DataTransfer<T>,
  ): Partial<T> {
    const isAllMust = keys.must.every((key) => raw[key] !== undefined);
    if (isAllMust) {
      const allowed = [...keys.must, ...(keys.optional ?? [])];
      return allowed.reduce((acc, key) => {
        if (raw[key] !== undefined) {
          acc[key] = raw[key];
        }
        return acc;
      }, {} as Partial<T>);
    }
    throw new Error(this.CONTROLLER_EXCEPTIONS.DATA_TRANSFER_INVALID);
  }

  protected formatResponse(code: number, result?: any) {
    let message = '';
    if (code >= 200 && code < 300) {
      message = 'ok';
    } else if (code === 400) {
      message = 'bad request';
    } else if (code === 401) {
      message = 'unauthorized';
    } else if (code === 403) {
      message = 'forbidden';
    } else if (code === 404) {
      message = 'not found';
    } else if (code === 500) {
      message = 'internal server error';
    } else {
      message = 'somewhat';
    }
    return {
      code,
      message,
      result,
    };
  }
}
