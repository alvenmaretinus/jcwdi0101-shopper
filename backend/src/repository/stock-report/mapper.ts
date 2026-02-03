import { FindStockReportsByFilterReq, StockReport } from "./entities";

export function toDomainModels(res: StockReport[], filter: FindStockReportsByFilterReq): StockReport[] {
    return res.map(item => toDomainModel(item, filter));
}

export function toDomainModel(item: any, filter: FindStockReportsByFilterReq): StockReport {
    const baseQuantity = Math.abs(item.quantityChange);
    const fromMatches = item.fromStoreId === filter.storeId;
    const toMatches = item.toStoreId === filter.storeId;

    let quantityChange: number;

    if (fromMatches && toMatches) {
        // Internal transfer within the same store: no net change for the store
        quantityChange = 0;
    } else if (fromMatches) {
        // Stock leaving the filtered store
        quantityChange = -baseQuantity;
    } else if (toMatches) {
        // Stock entering the filtered store
        quantityChange = baseQuantity;
    } else {
        // Movement does not involve the filtered store; preserve previous non-negative behavior
        quantityChange = baseQuantity;
    }

    return {
        ...item,
        quantityChange,
    };
}