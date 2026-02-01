import { PrismaClient } from "../../../prisma/generated/client";
import { FindStockReportsByFilterReq, StockReport } from "./entities";
import { StockReportRepository } from "./interface";

export class PrismaRepository implements StockReportRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async findStockReportsByFilter(filter: FindStockReportsByFilterReq): Promise<StockReport[]> {
        let res: StockReport[] = await this.prisma.productMovement.findMany({
            where: {
                OR: [
                    { fromStoreId: filter.storeId },
                    { toStoreId: filter.storeId },
                ],
                createdAt: {
                    // Date in JS is 0 to 11. Adjust accordingly.
                    gte: new Date(Date.UTC(filter.createdAtYear, filter.createdAtMonth-1, 1)),
                    lt: filter.createdAtMonth == 11 ? new Date(Date.UTC(filter.createdAtYear, 0, 1)) : new Date(Date.UTC(filter.createdAtYear, filter.createdAtMonth, 1)),
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
        for (let r of res) {
            r.quantityChange = r.fromStoreId != null && r.fromStoreId === filter.storeId ? -Math.abs(r.quantityChange) : Math.abs(r.quantityChange);
        }
        return res;
    }
}