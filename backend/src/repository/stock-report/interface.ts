import { FindStockReportsByFilterReq, StockReport } from "./entities";

export interface StockReportRepository {
    findStockReportsByFilter(filter: FindStockReportsByFilterReq): Promise<StockReport[]>   
}