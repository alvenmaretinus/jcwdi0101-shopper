import Decimal from "decimal.js";

export type VoucherCreateReq = {
    name: string;
    percentage?: Decimal;
    amount?: number;
    type: 'PERCENTAGE' | 'FIXED_AMOUNT';
    voucherType: 'REFERRAL' | 'TRANSACTIONAL' | 'FREEDELIVERY';
    isWithMinimum: boolean;
    minimumPrice?: number;
    startsAt?: Date;
    endsAt?: Date;
}

export type VoucherUpdateReq = {
    name?: string;
    percentage?: Decimal;
    amount?: number;
    type?: 'PERCENTAGE' | 'FIXED_AMOUNT';
    voucherType?: 'REFERRAL' | 'TRANSACTIONAL' | 'FREEDELIVERY';
    isWithMinimum?: boolean;
    minimumPrice?: number;
    startsAt?: Date;
    endsAt?: Date;
}

export type VoucherFilter = {
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
    discountId: string;
    voucherType: 'REFERRAL' | 'TRANSACTIONAL' | 'FREEDELIVERY';
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
        startsAt: Date | null;
        endsAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    };
}
