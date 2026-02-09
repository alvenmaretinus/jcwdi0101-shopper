export interface Discount {
  id: string;
  name: string;
  percentage?: number;
  amount?: number;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY';
  isWithMinimum: boolean;
  minimumPrice?: number;
  isLimited: boolean;
  limit?: number;
  isTiedToProduct: boolean;
  productId?: string;
  buyQuantity?: number;
  freeQuantity?: number;
  startsAt?: Date;
  endsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}