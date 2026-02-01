import { PrismaClient } from "../../../prisma/generated/client";
import { toDomainModels } from "./mapper";
import { FindStockReportsByFilterReq, StockReport } from "./entities";
import { StockReportRepository } from "./interface";

export class PrismaRepository implements StockReportRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async findStockReportsByFilter(filter: FindStockReportsByFilterReq): Promise<{ items: StockReport[]; total: number }> {
        const where = {
            OR: [
                { fromStoreId: filter.storeId },
                { toStoreId: filter.storeId },
            ],
            createdAt: {
                gte: new Date(Date.UTC(filter.createdAtYear, filter.createdAtMonth - 1, 1)),
                lt: filter.createdAtMonth == 11
                    ? new Date(Date.UTC(filter.createdAtYear, 0, 1))
                    : new Date(Date.UTC(filter.createdAtYear, filter.createdAtMonth, 1)),
            },
        };

        const select = {
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
        };

        const [rows, count]: [StockReport[], number] = await this.prisma.$transaction([
            this.prisma.productMovement.findMany({
                where,
                select,
                orderBy: [
                    { createdAt: "desc" },
                    { id: "desc" },
                ],
                skip: filter.skip,
                take: filter.take,
            }),
            this.prisma.productMovement.count({ where }),
        ]);

        return { items: toDomainModels(rows, filter), total: count };
    }
}