import Decimal from "decimal.js";

export type DiscountCreateReq = {
    name: string;
    percentage?: Decimal;
    amount?: number;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY';
    
    isVoucher?: boolean;
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
    name?: string;
    percentage?: Decimal;
    amount?: number;
    type?: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'QUANTITY';
    
    isVoucher?: boolean;
    isWithMinimum?: boolean;
    minimumPrice?: number;
    
    isTiedToProduct?: boolean;
    productId?: string;

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
    
    isTiedToProduct?: boolean;
    productId?: string;

    buyQuantity?: number;
    freeQuantity?: number;

    activeOnDate?: Date;
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

    isLimited: boolean;
    limit: number | null;
    
    isTiedToProduct: boolean;
    productId: string | null;

    buyQuantity: number | null;
    freeQuantity: number | null;

    startsAt: Date | null;
    endsAt: Date | null;

    createdAt: Date;
    updatedAt: Date;
}
    


