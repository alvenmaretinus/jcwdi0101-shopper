import { FindStockReportsByFilterReq, StockReport } from "./entities";

export function toDomainModels(res: StockReport[], filter: FindStockReportsByFilterReq): StockReport[] {
    return res.map(item => toDomainModel(item, filter));
}

export function toDomainModel(item: StockReport, filter: FindStockReportsByFilterReq): StockReport {
    return {...item,
        quantityChange: item.fromStoreId !== null && item.fromStoreId !== undefined && item.fromStoreId === filter.storeId ? 
        -Math.abs(item.quantityChange) : Math.abs(item.quantityChange)
    }
}