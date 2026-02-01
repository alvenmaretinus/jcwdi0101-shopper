import { FindStockReportsByFilterReq, StockReport } from "./entities";

export function toDomainModels(res: any[], filter: FindStockReportsByFilterReq): StockReport[] {
    return res.map(item => toDomainModel(item, filter));
}

export function toDomainModel(item: any, filter: FindStockReportsByFilterReq): StockReport {
    return {...item,
        quantityChange: item.fromStoreId != null && item.fromStoreId === filter.storeId ? 
        -Math.abs(item.quantityChange) : Math.abs(item.quantityChange)
    }
}