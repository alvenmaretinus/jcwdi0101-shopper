export interface Discount {
  id: string;
  name: string;
  percentage?: number;
  amount?: number;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY';
  isWithMinimum: boolean;
  minimumPrice?: number;
  hasDiscountAmountCap: boolean;
  maxDiscountAmount?: number;
  isQuantityLimited: boolean;
  maxUses?: number;
  useCounter?: number;
  isVoucher?: boolean;
  isTiedToProduct: boolean;
  productId?: string;
  product?: {
    id: string;
    name: string;
  };
  buyQuantity?: number;
  freeQuantity?: number;
  startsAt?: Date;
  endsAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}