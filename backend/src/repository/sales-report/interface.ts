import { SalesReportByFilterEntity, SalesReportEntity } from "./entities";

export interface SalesReportRepository {
    getSalesReportByFilterPaginated(params: SalesReportByFilterEntity): Promise<[SalesReportEntity[], number]>;
}