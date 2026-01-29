import { SalesReportByFilterEntity, SalesReportEntity } from "./entities";

export interface SalesReportRepository {
    getSalesReportByFilter(params: SalesReportByFilterEntity): Promise<SalesReportEntity[]>;
}