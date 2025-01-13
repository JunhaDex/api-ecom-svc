export interface AdminUser {
  id: number;
  adminId: string;
  name: string;
  createdAt: Date;
}

export interface AdminCreateInput {
  adminId: string;
  pwd: string;
  name: string;
}

export interface User {
  id: number;
  userId: string;
  branchName: string;
  branchManager: string;
  branchContact: string;
  status: number;
  groupId: number;
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
  userId?: string;
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
  products?: Product[];
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

export interface Notice {
  id: number;
  title: string;
  content: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface NoticeCreateInput {
  title: string;
  content: string;
}

export interface ProductUpdateInput {
  productName?: string;
  description?: string;
  imageUrls?: string[];
  productPrice?: number;
}

export interface Payment {
  id: number;
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
  orderId: string;
  paidAmount: number;
  paidAt: Date;
}

export interface PaymentConfirmInput {
  payMethod: string;
  paymentKey: string;
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

export interface Transaction {
  id: number;
  paymentId: number;
  txName: string;
  txNote: string;
  userId: number;
  status: number;
  createdAt: Date;
  updatedAt: Date;
  shipment?: Shipment;
  payment?: Payment;
  user?: User;
  products?: {
    product: Product;
    count: number;
    price: number;
  }[];
}

export interface TxAdminItem {
  id: number;
  txName: string;
  txNote: string;
  status: number;
  payment: Payment;
  user: {
    id: number;
    userId: string;
    branchName: string;
    branchManager: string;
    branchContact: string;
  };
  products?: {
    product: Product;
    count: number;
    price: number;
  }[];
  shipment?: Shipment;
  createdAt: Date;
}

export interface TransactionCreateInput {
  products: {
    item: Product;
    quantity: number;
  }[];
  payment: PaymentCreateInput;
  txName: string;
  txNote: string;
}

export interface Shipment {
  id: number;
  txId: number;
  courierId: number;
  address: string;
  recipientName: string;
  recipientPhone: string;
  trackingNo: string;
  status: number;
  createdAt: Date;
  updatedAt: Date;
  courier?: Courier;
  transaction?: Transaction;
}

export interface ShipmentCreateInput {
  orderId: string;
  address: string;
  postalCode: string;
  recipientName: string;
  recipientPhone: string;
  courierId?: number;
  trackingNo?: string;
  status?: number;
}
