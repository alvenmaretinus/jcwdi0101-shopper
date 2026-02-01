import { StockReport } from "../../repository/stock-report/entities";
import { StockReportRepository } from "../../repository/stock-report/interface";
import { GetStockReportByFilterInput } from "../../schema/stock-report/GetStockReportByFilterSchema";
import { Service } from "./interface";

export class StockReportService implements Service {
    private stockReportRepo: StockReportRepository;
    constructor(stockReportRepo: StockReportRepository) {
        this.stockReportRepo = stockReportRepo;
    }

    async getStockReportsByFilter(input: GetStockReportByFilterInput): Promise<{ items: StockReport[]; total: number }> {
        return this.stockReportRepo.findStockReportsByFilter(input);
    }
}