export interface AdminUser {
  id: number;
  adminId: string;
  name: string;
  createdAt: Date;
}

export interface AdminCreateInput {
  userId: string;
  pwd: string;
  name: string;
}

export interface LoginInput {
  userId: string;
  password: string;
}

export interface User {
  id: number;
  userId: string;
  branchName: string;
  branchManager: string;
  branchContact: string;
  status: number;
  createdAt: Date;
  updatedAt: Date;
  userGroup?: UserGroup;
}

export interface UserCreateInput {
  userId: string;
  pwd: string;
  branchName: string;
  branchManager: string;
  branchContact: string;
}

export interface UserUpdateInput {
  branchName?: string;
  branchManager?: string;
  branchContact?: string;
}

export interface UserGroup {
  id: number;
  groupName: string;
  description: string;
  createdAt: Date;
  users?: User[];
  usersCount?: number;
  products?: Product[];
  productsCount?: number;
}

export interface UserGroupCreateInput {
  groupName: string;
  description: string;
}

export interface UserGroupUpdateInput {
  groupName?: string;
  description?: string;
}

export interface Product {
  id: number;
  productName: string;
  description: string;
  imageUrls: string[];
  productPrice: number;
  status: number;
  createdAt: Date;
}

export interface ProductCreateInput {
  productName: string;
  description: string;
  imageUrls: string[];
  productPrice: number;
}

export interface ProductUpdateInput {
  productName?: string;
  description?: string;
  imageUrls?: string[];
  productPrice?: number;
}

export interface Payment {
  id: number;
  sessionKey: string;
  payMethod: string;
  paymentKey: string;
  orderId: string;
  paidAmount: number;
  balanceAmount: number;
  paidAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentCreateInput {
  sessionKey: string;
  payMethod: string;
  paymentKey: string;
  orderId: string;
  paidAmount: number;
  balanceAmount: number;
  paidAt: Date;
}

export interface Courier {
  id: number;
  courierName: string;
  apiUrl: string;
  createdAt: Date;
}

export interface CourierCreateInput {
  courierName: string;
  apiUrl: string;
}

export interface CourierUpdateInput {
  courierName?: string;
  apiUrl?: string;
}
