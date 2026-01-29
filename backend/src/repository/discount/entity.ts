import { Decimal } from "decimal.js"

export type DiscountCreateReq = {
    percentage?: Decimal;
    amount?: number;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY';
    
    isWithMinimum: boolean;
    minimumPrice?: number;
    
    isTiedToProduct: boolean;
    productId?: string;

    buyQuantity?: number;
    freeQuantity?: number;

    startsAt?: Date;
    endsAt?: Date;
}

export type DiscountUpdateReq = {
    percentage?: Decimal;
    amount?: number;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY';
    
    isWithMinimum: boolean;
    minimumPrice?: number;
    
    isTiedToProduct: boolean;
    productId?: string;

    buyQuantity?: number;
    freeQuantity?: number;

    startsAt?: Date;
    endsAt?: Date;
}

export type DiscountFilter = {
    percentage?: Decimal;
    amount?: number;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY';
    
    isWithMinimum?: boolean;
    minimumPrice?: number;
    
    isTiedToProduct: boolean;
    productId?: string;

    buyQuantity?: number;
    freeQuantity?: number;

    startsAt?: Date;
    endsAt?: Date;
}

export type  DiscountResponse = {
    id: string;

    percentage: Decimal | null;
    amount: number | null;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY';
    
    isWithMinimum: boolean;
    minimumPrice: number | null;
    
    isTiedToProduct: boolean;
    productId: string | null;

    buyQuantity: number | null;
    freeQuantity: number | null;

    startsAt: Date | null;
    endsAt: Date | null;
}
    
