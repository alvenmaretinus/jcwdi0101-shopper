// Types based on Prisma schema

export type UserRole = 'USER' | 'ADMIN' | 'SUPERADMIN';
export type UserProvider = 'GOOGLE' | 'LOCAL';

export type OrderStatus = 
  | 'PAYMENT_PENDING'
  | 'PAYMENT_WAITING_CONFIRMATION'
  | 'PAYMENT_EXPIRED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type OrderPaymentType = 'BANK_TRANSFER' | 'PAYMENT_GATEWAY';

export type MovementType = 
  | 'PURCHASED'
  | 'SOLD'
  | 'REALLOCATED'
  | 'CANCELED'
  | 'ADJUSTMENT';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  provider: UserProvider;
  profileUrl?: string;
  referralCode: string;
  storeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAddress {
  id: string;
  email: string;
  isDefault: boolean;
  longitude: number;
  latitude: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Many-to-many relationship: Store can have many admins
export interface StoreAdmin {
  id: string;
  storeId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  name: string;
  description?: string;
  longitude: number;
  latitude: number;
  addressId: string;
  addressName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  category?: ProductCategory;
  images?: ProductImage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductImage {
  id: string;
  url: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductStore {
  id: string;
  quantity: number;
  productId: string;
  storeId: string;
  product?: Product;
  store?: Store;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductMovement {
  id: string;
  orderId?: string;
  quantityChange: number;
  productName: string;
  productCategory: string;
  movementType: MovementType;
  description?: string;
  fromStoreName?: string;
  toStoreName?: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  subtotal: number;
  totalDiscount: number;
  shippingCost: number;
  grandTotal: number;
  status: OrderStatus;
  paymentType: OrderPaymentType;
  cancelReason?: string;
  paymentProofUrl?: string;
  shippingAddress: string;
  storeAddress: string;
  storeName: string;
  storeId: string;
  userId: string;
  user?: User;
  orderItems?: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  paymentDueAt?: Date;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  productName: string;
  productCategory: string;
  orderId: string;
  productId: string;
}

export interface Discount {
  id: string;
  name: string;
  type: 'PERCENTAGE' | 'FIXED' | 'BUY_ONE_GET_ONE';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  productId?: string;
  storeId?: string;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminAuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}
