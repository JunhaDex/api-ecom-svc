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
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserGroup {
  id: number;
  groupName: string;
  description: string;
  createdAt: Date;
  users?: User[];
  products?: Product[];
}

export interface Product {
  id: number;
  productName: string;
  description: string;
  imageUris: string;
  productPrice: number;
  status: string;
  productDescription: string;
  createdAt: Date;
}
