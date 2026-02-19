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
   * Calculate the date range for the given month and year (for filtering)
   */
  private buildDateRange(year: number, month: number): { start: Date; end: Date } {
    const start: Date = new Date(Date.UTC(year, month - 1, 1));
    const end: Date = month === 12 
      ? new Date(Date.UTC(year + 1, 0, 1)) 
      : new Date(Date.UTC(year, month, 1));
    
    return { start, end };
  }

  /**
   * Build store filter condition (fromStore OR toStore) with verbose structure
   */
  private buildStoreFilter(storeId: string): Prisma.ProductMovementWhereInput {
    const fromStoreCondition: Prisma.ProductMovementWhereInput = { 
      fromStoreId: storeId 
    };
    
    const toStoreCondition: Prisma.ProductMovementWhereInput = { 
      toStoreId: storeId 
    };
    
    const storeOrConditions: Prisma.ProductMovementWhereInput[] = [
      fromStoreCondition, 
      toStoreCondition
    ];
    
    return { OR: storeOrConditions };
  }

  /**
   * Build date filter condition with verbose structure
   */
  private buildDateFilter(start: Date, end: Date): Prisma.ProductMovementWhereInput {
    const createdAtRange: Prisma.DateTimeFilter = {
      gte: start,
      lt: end,
    };
    
    return { createdAt: createdAtRange };
  }

  /**
   * Build select clause for product movement query
   */
  private buildProductMovementSelect(): Prisma.ProductMovementSelect {
    return {
      id: true,
      description: true,
      updatedAt: true,
      productId: true,
      product: {
        select: {
          name: true,
        },
      },
      orderId: true,
      movementType: true,
      fromStoreId: true,
      fromStore: {
        select: {
          name: true,
        },
      },
      toStoreId: true,
      toStore: {
        select: {
          name: true,
        },
      },
      quantityChange: true,
      createdAt: true,
    } as const;
  }

  /**
   * Build properly typed query for stock report filtering
   * Separates concerns: query building vs execution
   */
  private buildStockReportQuery(filter: FindStockReportsByFilterReq) {
    const { start, end } = this.buildDateRange(filter.createdAtYear, filter.createdAtMonth);
    const dateFilterCondition = this.buildDateFilter(start, end);
    
    const andConditions: Prisma.ProductMovementWhereInput[] = [
      dateFilterCondition,
    ];

    // Only add store filter if storeId is provided
    if (filter.storeId) {
      const storeFilterCondition = this.buildStoreFilter(filter.storeId);
      andConditions.push(storeFilterCondition);
    }

    const where: Prisma.ProductMovementWhereInput = {
      AND: andConditions,
    };

    const select = this.buildProductMovementSelect();

    return { where, select };
  }

  private buildOrderBy(): Prisma.ProductMovementOrderByWithRelationInput[] {
    const orderByCreatedAt: Prisma.ProductMovementOrderByWithRelationInput = { createdAt: "desc" };
    const orderById: Prisma.ProductMovementOrderByWithRelationInput = { id: "desc" };
    return [orderByCreatedAt, orderById];
  }

  private async fetchRowsAndCount(where: Prisma.ProductMovementWhereInput, select: Prisma.ProductMovementSelect, filter: FindStockReportsByFilterReq): Promise<[StockReport[], number]> {
    const orderBy = this.buildOrderBy();
    return this.prisma.$transaction([
      this.prisma.productMovement.findMany({ where, select, orderBy, skip: filter.skip, take: filter.take }),
      this.prisma.productMovement.count({ where }),
    ]);
  }

  async findStockReportsByFilter(filter: FindStockReportsByFilterReq): Promise<{ items: StockReport[]; total: number }> {
    const { where, select } = this.buildStockReportQuery(filter);
    const [rows, count] = await this.fetchRowsAndCount(where, select, filter);
    return { items: toDomainModels(rows, filter), total: count };
  }
}
