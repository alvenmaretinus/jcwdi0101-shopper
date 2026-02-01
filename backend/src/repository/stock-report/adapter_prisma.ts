import { PrismaClient } from "../../../prisma/generated/client";
import { FindStockReportsByFilterReq, StockReport } from "./entities";
import { StockReportRepository } from "./interface";

export class PrismaRepository implements StockReportRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async findStockReportsByFilter(filter: FindStockReportsByFilterReq): Promise<StockReport[]> {
        return this.prisma.productMovement.findMany({
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
            select: {
                id: true,
                description: true,
                updatedAt: true,
                productCategory: true,
                productId: true,
                orderId: true,
                productName: true,
                movementType: true,
                fromStoreId: true,
                toStoreId: true,
                quantityChange: true,
                createdAt: true,
            },
            skip: filter.skip,
            take: filter.take,
        });
    }
}