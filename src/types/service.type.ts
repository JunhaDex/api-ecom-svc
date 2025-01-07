import { Product, User } from '@/types/admin.type';

export interface UserCache {
  id: number;
  userId: string;
  branchName: string;
  branchManager: string;
  branchContact: string;
}

export interface CartItem {
  id: number;
  count: number;
  product?: Product;
}

export interface CartItemInput {
  userId: number;
  productId: number;
  count: number;
}

export interface TossPayload {
  orderId: string;
  amount: string;
  paymentKey: string;
}
