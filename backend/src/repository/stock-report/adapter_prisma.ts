import { PrismaClient } from "../../../prisma/generated/client";
import type { Prisma } from "../../../prisma/generated/client";
import { toDomainModels } from "./mapper";
import { FindStockReportsByFilterReq, StockReport, FindSummaryStockReportReq, SummaryStockReportItem, FindDetailedStockReportReq, DetailedMovementRecord } from "./entities";
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
   * This allows admins to see all movements that affect their store:
   * - Movements FROM their store (outgoing stock)
   * - Movements TO their store (incoming stock)
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
    
    console.log('[Stock Report Repository] Query filter:', JSON.stringify(where, null, 2));
    console.log('[Stock Report Repository] Date range:', this.buildDateRange(filter.createdAtYear, filter.createdAtMonth));
    
    const [rows, count] = await this.fetchRowsAndCount(where, select, filter);
    
    console.log('[Stock Report Repository] Found rows:', rows.length, 'Total count:', count);
    
    return { items: toDomainModels(rows, filter), total: count };
  }

  /**
   * Find summary stock report: aggregated inventory data per product per month
   * Returns: total additions, total reductions, and ending stock per product
   */
  async findSummaryStockReport(filter: FindSummaryStockReportReq): Promise<{ items: SummaryStockReportItem[]; total: number }> {
    const { start, end } = this.buildDateRange(filter.createdAtYear, filter.createdAtMonth);
    
    // Fetch all movements for the month
    const andConditions: Prisma.ProductMovementWhereInput[] = [
      { createdAt: { gte: start, lt: end } },
    ];

    if (filter.storeId) {
      andConditions.push(this.buildStoreFilter(filter.storeId));
    }

    const allMovements = await this.prisma.productMovement.findMany({
      where: { AND: andConditions },
      select: {
        productId: true,
        product: { select: { name: true } },
        quantityChange: true,
        movementType: true,
        fromStoreId: true,
        toStoreId: true,
        endStock: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by product and aggregate
    const groupedByProduct: Record<string, {
      productName: string;
      movements: typeof allMovements;
    }> = {};

    for (const movement of allMovements) {
      if (!groupedByProduct[movement.productId]) {
        groupedByProduct[movement.productId] = {
          productName: movement.product.name,
          movements: [],
        };
      }
      groupedByProduct[movement.productId].movements.push(movement);
    }

    const productIds = Object.keys(groupedByProduct);
    
    // For "All Stores" case, fetch sum of quantities from ProductStore
    // For store-specific case, fetch quantity only for that store
    const allStoresEndingStockByProductId = new Map<string, number>();
    const storeSpecificEndingStockByProductId = new Map<string, number>();
    
    const productStoreWhere: Prisma.ProductStoreWhereInput = {
      productId: { in: productIds },
    };

    if (filter.storeId) {
      productStoreWhere.storeId = filter.storeId;
    }

    const productStoreRows = await this.prisma.productStore.findMany({
      where: productStoreWhere,
      select: {
        productId: true,
        storeId: true,
        quantity: true,
      },
    });

    // Organize by product and store
    for (const row of productStoreRows) {
      if (filter.storeId) {
        // Store-specific: sum quantities for the specific store
        const current = storeSpecificEndingStockByProductId.get(row.productId) ?? 0;
        storeSpecificEndingStockByProductId.set(row.productId, current + row.quantity);
      } else {
        // All stores: sum quantities across all stores per product
        const current = allStoresEndingStockByProductId.get(row.productId) ?? 0;
        allStoresEndingStockByProductId.set(row.productId, current + row.quantity);
      }
    }

    // Calculate summary for each product
    const summarizedReports: SummaryStockReportItem[] = Object.entries(groupedByProduct).map(([productId, data]) => {
      let totalAdditions = 0;
      let totalReductions = 0;

      for (const movement of data.movements) {
        // For specific store filtering
        if (filter.storeId) {
          const fromMatches = movement.fromStoreId === filter.storeId;
          const toMatches = movement.toStoreId === filter.storeId;

          // Stock coming into the store (additions)
          if (toMatches && !fromMatches) {
            totalAdditions += Math.abs(movement.quantityChange);
          }
          // Stock going out of the store (reductions)
          else if (fromMatches && !toMatches) {
            totalReductions += Math.abs(movement.quantityChange);
          }
          // Internal transfer: no net change
        } else {
          // No store filter: count all
          if (movement.quantityChange > 0) {
            totalAdditions += movement.quantityChange;
          } else {
            totalReductions += Math.abs(movement.quantityChange);
          }
        }
      }

      // Calculate ending stock based on filter context
      let endingStock: number;
      if (filter.storeId) {
        // For store-specific reports: use store-specific ending stock from ProductStore
        // This ensures: endingStock = startingStock + additions - reductions
        endingStock = storeSpecificEndingStockByProductId.get(productId) ?? 0;
      } else {
        // For all-stores reports: sum ending stocks from all stores for this product
        // This gives the total inventory across all stores
        endingStock = allStoresEndingStockByProductId.get(productId) ?? 0;
      }

      return {
        productId,
        productName: data.productName,
        totalAdditions,
        totalReductions,
        endingStock,
      };
    });

    // Sort and paginate
    const sortedReports = summarizedReports
      .sort((a, b) => a.productName.localeCompare(b.productName))
      .slice(filter.skip, filter.skip + filter.take);

    return {
      items: sortedReports,
      total: summarizedReports.length,
    };
  }

  /**
   * Find detailed stock report: all movements for a specific product and store in a month
   * Uses ProductStore quantity as endStock in each movement record
   * Returns: individual movement records with quantity change and ending stock per store
   */
  async findDetailedStockReport(filter: FindDetailedStockReportReq): Promise<{ items: DetailedMovementRecord[]; startingStock: number; endingStock: number; total: number }> {
    const { start, end } = this.buildDateRange(filter.createdAtYear, filter.createdAtMonth);

    // StoreId is required for detailed reports (per store tracking)
    if (!filter.storeId) {
      return { items: [], startingStock: 0, endingStock: 0, total: 0 };
    }

    // Get the product info
    const product = await this.prisma.product.findUnique({
      where: { id: filter.productId },
    });

    if (!product) {
      return { items: [], startingStock: 0, endingStock: 0, total: 0 };
    }

    const productStore = await this.prisma.productStore.findFirst({
      where: {
        productId: filter.productId,
        storeId: filter.storeId,
      },
      select: { quantity: true },
    });
    const currentStock = productStore?.quantity ?? 0;

    // Get movements involving this store for this product in the month
    const movements = await this.prisma.productMovement.findMany({
      where: {
        AND: [
          { productId: filter.productId },
          { createdAt: { gte: start, lt: end } },
          {
            OR: [
              { fromStoreId: filter.storeId },
              { toStoreId: filter.storeId },
            ],
          },
        ],
      },
      select: {
        id: true,
        createdAt: true,
        movementType: true,
        description: true,
        quantityChange: true,
        endStock: true,
        fromStoreId: true,
        fromStore: { select: { name: true } },
        toStoreId: true,
        toStore: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const getSignedQuantityChange = (movement: { quantityChange: number; fromStoreId: string | null; toStoreId: string | null }): number => {
      const fromMatches = movement.fromStoreId === filter.storeId;
      const toMatches = movement.toStoreId === filter.storeId;
      const baseQuantity = Math.abs(movement.quantityChange);

      if (fromMatches && toMatches) return 0;
      if (fromMatches) return -baseQuantity;
      if (toMatches) return baseQuantity;
      return movement.quantityChange;
    };

    // Get the starting stock: first movement of month, calculate backwards from endStock and quantityChange
    let startingStock = 0;
    if (movements.length > 0) {
      const firstMovement = movements[0];
      const firstMovementSignedChange = getSignedQuantityChange(firstMovement);
      // Starting stock = ending stock after first movement - net change caused by first movement
      startingStock = firstMovement.endStock !== null
        ? firstMovement.endStock - firstMovementSignedChange
        : currentStock;
    } else {
      // No movements this month: use current ProductStore quantity as reference
      startingStock = currentStock;
    }

    // Create detailed records, normalizing movement sign by store direction.
    // If historical movement endStock is null, infer from running stock.
    let runningStock = startingStock;
    const detailedRecords: DetailedMovementRecord[] = movements.map((m) => {
      const signedChange = getSignedQuantityChange(m);
      const movementEndStock = m.endStock ?? (runningStock + signedChange);
      runningStock = movementEndStock;

      return {
        id: m.id,
        date: m.createdAt,
        movementType: m.movementType,
        description: m.description,
        fromStoreName: m.fromStore?.name || null,
        toStoreName: m.toStore?.name || null,
        quantityChange: signedChange,
        endStock: movementEndStock,
      };
    });

    const endingStock = detailedRecords.length > 0
      ? (detailedRecords[detailedRecords.length - 1].endStock ?? currentStock)
      : startingStock;

    // Apply pagination to the detailed records after calculation
    const total = detailedRecords.length;
    const paginatedRecords = detailedRecords.slice(
      filter.skip,
      filter.skip + filter.take
    );

    return {
      items: paginatedRecords,
      startingStock,
      endingStock,
      total,
    };
  }
}
