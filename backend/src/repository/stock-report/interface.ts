import { FindStockReportsByFilterReq, StockReport, FindSummaryStockReportReq, SummaryStockReportItem, FindDetailedStockReportReq, DetailedMovementRecord } from "./entities";

export interface StockReportRepository {
    findStockReportsByFilter(filter: FindStockReportsByFilterReq): Promise<{ items: StockReport[]; total: number }>;
    findSummaryStockReport(filter: FindSummaryStockReportReq): Promise<{ items: SummaryStockReportItem[]; total: number }>;
    findDetailedStockReport(filter: FindDetailedStockReportReq): Promise<{ items: DetailedMovementRecord[]; startingStock: number; endingStock: number; total: number }>;
}