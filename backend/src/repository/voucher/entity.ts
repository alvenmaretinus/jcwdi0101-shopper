import Decimal from "decimal.js";

export type VoucherCreateReq = {
    code: string;
    userId?: string;
    referralRole?: 'REFERRER' | 'REFEREE';
    name: string;
    percentage?: Decimal;
    amount?: number;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT';
    voucherType: 'REFERRAL' | 'TRANSACTIONAL' | 'FREEDELIVERY';
    isWithMinimum: boolean;
    minimumPrice?: number;
    isLimited?: boolean;
    limit?: number;
    startsAt?: Date;
    endsAt?: Date;
}

export type VoucherUpdateReq = {
    code?: string;
    userId?: string;
    referralRole?: 'REFERRER' | 'REFEREE';
    name?: string;
    percentage?: Decimal;
    amount?: number;
    type?: 'PERCENTAGE' | 'FIXED_AMOUNT';
    voucherType?: 'REFERRAL' | 'TRANSACTIONAL' | 'FREEDELIVERY';
    isWithMinimum?: boolean;
    minimumPrice?: number;
    isLimited?: boolean;
    limit?: number;
    startsAt?: Date;
    endsAt?: Date;
}

export type VoucherFilter = {
    code?: string;
    userId?: string;
    referralRole?: 'REFERRER' | 'REFEREE';
    name?: string;
    percentage?: Decimal;
    amount?: number;
    type?: 'PERCENTAGE' | 'FIXED_AMOUNT';
    voucherType?: 'REFERRAL' | 'TRANSACTIONAL' | 'FREEDELIVERY';
    isRedeemed?: boolean;
    isWithMinimum?: boolean;
    minimumPrice?: number;
    activeOnDate?: Date;
}

export type VoucherResponse = {
    id: string;
    code: string;
    discountId: string;
    userId: string | null;
    voucherType: 'REFERRAL' | 'TRANSACTIONAL' | 'FREEDELIVERY';
    referralRole: 'REFERRER' | 'REFEREE' | null;
    isRedeemed: boolean;
    redeemedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    discount: {
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
        useCounter: number;
        startsAt: Date | null;
        endsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    };
}
