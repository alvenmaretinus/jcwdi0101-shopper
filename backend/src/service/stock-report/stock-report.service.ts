import { StockReport, FindSummaryStockReportReq, SummaryStockReportItem, FindDetailedStockReportReq, DetailedMovementRecord } from "../../repository/stock-report/entities";
import { StockReportRepository } from "../../repository/stock-report/interface";
import { GetStockReportByFilterInput } from "../../schema/stock-report/GetStockReportByFilterSchema";
import { GetSummaryStockReportInput } from "../../schema/stock-report/SummaryStockReportSchema";
import { GetDetailedStockReportInput } from "../../schema/stock-report/DetailedStockReportSchema";
import { Service } from "./interface";

export class StockReportService implements Service {
    private stockReportRepo: StockReportRepository;
    constructor(stockReportRepo: StockReportRepository) {
        this.stockReportRepo = stockReportRepo;
    }

    async getStockReportsByFilter(input: GetStockReportByFilterInput): Promise<{ items: StockReport[]; total: number }> {
        return this.stockReportRepo.findStockReportsByFilter(input);
    }

    async getSummaryStockReport(input: GetSummaryStockReportInput): Promise<{ items: SummaryStockReportItem[]; total: number }> {
        return this.stockReportRepo.findSummaryStockReport(input);
    }

    async getDetailedStockReport(input: GetDetailedStockReportInput): Promise<{ items: DetailedMovementRecord[]; startingStock: number; endingStock: number; total: number }> {
        return this.stockReportRepo.findDetailedStockReport(input);
    }
}