import { SalesReportEntity } from "../../repository/sales-report/entities";
import { SalesReportRepository } from "../../repository/sales-report/interface";
import { GetSalesReportByFilterInput } from "../../schema/sales-report";
import { Service } from "./interface";

export class SalesReportService implements Service {
    private salesReportRepository: SalesReportRepository;

    constructor(salesReportRepository: SalesReportRepository) {
        this.salesReportRepository = salesReportRepository;
    }

    async getSalesReportByFilter(params: GetSalesReportByFilterInput): Promise<SalesReportEntity[]> {
        return await this.salesReportRepository.getSalesReportByFilter(params);
    }
}