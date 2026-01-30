import { MovementType } from "../../../prisma/generated/enums";

export type FindStockReportsByFilterReq = {
    storeId: string;
    createdAtMonth: number;
    createdAtYear: number;
}


export type StockReport = {

    id: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    productId: string;
    productCategory: string;
    productName: string;
    orderId: string | null;
    quantityChange: number;
    movementType: MovementType;
    fromStoreId: string | null;
    toStoreId: string | null;
}