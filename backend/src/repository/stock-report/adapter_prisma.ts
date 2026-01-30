import { PrismaClient } from "../../../prisma/generated/client";
import { FindStockReportsByFilterReq, StockReport } from "./entities";
import { StockReportRepository } from "./interface";

export class PrismaRepository implements StockReportRepository {
    private prismaClient: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prismaClient = prismaClient;
    }

    async findStockReportsByFilter(filter: FindStockReportsByFilterReq): Promise<StockReport[]> {
        // Implement the logic to query the database using Prisma Client based on the filter
        return this.prismaClient.productMovement.findMany({
            where: {
                OR: [
                    { fromStoreId: filter.storeId },
                    { toStoreId: filter.storeId },
                ],
                createdAt: {
                    gte: new Date(filter.createdAtYear, filter.createdAtMonth - 1, 1),
                    lt: new Date(filter.createdAtYear, filter.createdAtMonth, 1),
                },
            },
        });
    }
}