import { PrismaClient } from "../../../prisma/generated/client";
import type { Prisma } from "../../../prisma/generated/client";
import { toDomainModels } from "./mapper";
import { FindStockReportsByFilterReq, StockReport } from "./entities";
import { StockReportRepository } from "./interface";

export class PrismaRepository implements StockReportRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Build properly typed query for stock report filtering
   * Separates concerns: query building vs execution
   */
  private buildStockReportQuery(filter: FindStockReportsByFilterReq) {
    const createdAtStart = new Date(Date.UTC(filter.createdAtYear, filter.createdAtMonth - 1, 1));
    const createdAtEnd = filter.createdAtMonth === 12 ? new Date(Date.UTC(filter.createdAtYear + 1, 0, 1)) : new Date(Date.UTC(filter.createdAtYear, filter.createdAtMonth, 1));

    // Properly typed where clause - Prisma will validate at compile-time
    const where: Prisma.ProductMovementWhereInput = {
      AND: [
        {
          OR: [{ fromStoreId: filter.storeId }, { toStoreId: filter.storeId }],
        },
        {
          createdAt: {
            gte: createdAtStart,
            lt: createdAtEnd,
          },
        },
      ],
    };

    // Use const assertion for type inference
    const select = {
      id: true,
      description: true,
      updatedAt: true,
      productId: true,
      orderId: true,
      movementType: true,
      fromStoreId: true,
      toStoreId: true,
      quantityChange: true,
      createdAt: true,
    } as const;

    return { where, select };
  }

  async findStockReportsByFilter(filter: FindStockReportsByFilterReq): Promise<{ items: StockReport[]; total: number }> {
    const { where, select } = this.buildStockReportQuery(filter);

    const [rows, count]: [StockReport[], number] = await this.prisma.$transaction([
      this.prisma.productMovement.findMany({
        where,
        select,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: filter.skip,
        take: filter.take,
      }),
      this.prisma.productMovement.count({ where }),
    ]);

    return { items: toDomainModels(rows, filter), total: count };
  }
}
