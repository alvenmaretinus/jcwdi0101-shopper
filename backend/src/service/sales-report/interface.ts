import { SalesReportEntity } from "../../repository/sales-report/entities";
import { GetSalesReportByFilterInput } from "../../schema/sales-report";

interface SalesReportService {
    getSalesReportByFilter(params: GetSalesReportByFilterInput): Promise<SalesReportEntity[]>
}

export type Service = SalesReportService