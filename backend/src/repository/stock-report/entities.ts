import { MovementType } from "../../../prisma/generated/enums";

export type FindStockReportsByFilterReq = {
    storeId?: string;
    createdAtMonth: number;
    createdAtYear: number;
    skip: number;
    take: number;
}

export type FindSummaryStockReportReq = {
    storeId?: string;
    createdAtMonth: number;
    createdAtYear: number;
    skip: number;
    take: number;
}

export type FindDetailedStockReportReq = {
    productId: string;
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

/**
 * Summary report item: aggregated inventory data per product per month
 */
export type SummaryStockReportItem = {
    productId: string;
    productName: string;
    totalAdditions: number;
    totalReductions: number;
    endingStock: number;
}

/**
 * Detailed report item: individual movement record
 */
export type DetailedMovementRecord = {
    id: string;
    date: Date;
    movementType: MovementType;
    description: string | null;
    fromStoreName: string | null;
    toStoreName: string | null;
    quantityChange: number;
    endStock: number | null;
}
