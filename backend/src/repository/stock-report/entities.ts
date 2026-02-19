import { MovementType } from "../../../prisma/generated/enums";

export type FindStockReportsByFilterReq = {
    storeId?: string;
    createdAtMonth: number;
    createdAtYear: number;
    skip: number;
    take: number;
}


export type StockReport = {
    id: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    productId: string;
    product: {
        name: string;
    };
    orderId: string | null;
    quantityChange: number;
    movementType: MovementType;
    fromStoreId: string | null;
    fromStore: {
        name: string;
    } | null;
    toStoreId: string | null;
    toStore: {
        name: string;
    } | null;
}