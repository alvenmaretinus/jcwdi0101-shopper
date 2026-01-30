import { StockReport } from "../../repository/stock-report/entities";
import {GetStockReportByFilterInput} from "../../schema/stock-report/GetStockReportByFilterSchema";

interface StockReportService {
    getStockReportsByFilter(input: GetStockReportByFilterInput): Promise<StockReport[]>
}

export type Service = StockReportService;