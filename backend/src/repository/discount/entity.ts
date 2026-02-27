import Decimal from "decimal.js";
import { StackedDiscountResult } from "../../lib/discount/calculateStackedDiscount";

export type DiscountCreateReq = {
    name: string;
    percentage?: Decimal;
    amount?: number;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY';
    
    isVoucher?: boolean;
    isWithMinimum: boolean;
    minimumPrice?: number;
    
    hasDiscountAmountCap?: boolean;
    maxDiscountAmount?: number;
    
    isQuantityLimited?: boolean;
    maxUses?: number;
    useCounter?: number;
    
    isTiedToProduct: boolean;
    productId?: string | null;

    buyQuantity?: number;
    freeQuantity?: number;

    startsAt?: Date;
    endsAt?: Date;
}

export type DiscountUpdateReq = {
    name?: string;
    percentage?: Decimal;
    amount?: number;
    type?: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY';
    
    isVoucher?: boolean;
    isWithMinimum?: boolean;
    minimumPrice?: number;
    
    hasDiscountAmountCap?: boolean;
    maxDiscountAmount?: number;
    
    isQuantityLimited?: boolean;
    maxUses?: number;
    useCounter?: number;
    
    isTiedToProduct?: boolean;
    productId?: string | null;

    buyQuantity?: number;
    freeQuantity?: number;

    startsAt?: Date;
    endsAt?: Date;
}

export type DiscountFilter = {
    name?: string;
    percentage?: Decimal;
    amount?: number;
    type?: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY';
    
    isVoucher?: boolean;
    isWithMinimum?: boolean;
    minimumPrice?: number;
    
    hasDiscountAmountCap?: boolean;
    maxDiscountAmount?: number;
    
    isQuantityLimited?: boolean;
    maxUses?: number;
    useCounter?: number;
    
    isTiedToProduct?: boolean;
    productId?: string;

    buyQuantity?: number;
    freeQuantity?: number;

    activeOnDate?: Date;
    isSoftDeleted?: boolean;
}

export type  DiscountResponse = {
    id: string;

    name: string | null;
    percentage: Decimal | null;
    amount: number | null;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY';
    
    isVoucher: boolean;
    isWithMinimum: boolean;
    minimumPrice: number | null;

    hasDiscountAmountCap: boolean;
    maxDiscountAmount: number | null;

    isQuantityLimited: boolean;
    maxUses: number | null;
    useCounter: number;
    
    isTiedToProduct: boolean;
    productId: string | null;

    buyQuantity: number | null;
    freeQuantity: number | null;

    startsAt: Date | null;
    endsAt: Date | null;
    
    isSoftDeleted: boolean;

    createdAt: Date;
    updatedAt: Date;
    
    // Optional: included when queried with product relation
    product?: {
        id: string;
        name: string;
        description: string | null;
        price: number;
        weight: number;
        categoryId: string;
        category?: {
            id: string;
            name: string;
        };
        productImages?: Array<{
            id: string;
            url: string;
        }>;
        discountedPricing?: StackedDiscountResult;
    };
}
    


