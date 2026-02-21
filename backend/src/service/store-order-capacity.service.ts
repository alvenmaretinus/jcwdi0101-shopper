import type { OrderStatus, PrismaClient } from "../../prisma/generated/client";

const ACTIVE_STORE_ORDER_STATUSES: OrderStatus[] = [
  "PAYMENT_PENDING",
  "PAYMENT_WAITING_CONFIRMATION",
  "PROCESSING",
];

const DEFAULT_MAX_ACTIVE_ORDERS_PER_STORE = 15;

type OrderDbClient = Pick<PrismaClient, "order">;

export class StoreOrderCapacityService {
  static getMaxActiveOrdersPerStore(): number {
    const parsed = Number(process.env.STORE_MAX_ACTIVE_ORDERS);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return DEFAULT_MAX_ACTIVE_ORDERS_PER_STORE;
    }

    return Math.floor(parsed);
  }

  static async getActiveOrderCountByStoreId(db: OrderDbClient, storeId: string): Promise<number> {
    return db.order.count({
      where: {
        storeId,
        status: { in: ACTIVE_STORE_ORDER_STATUSES },
      },
    });
  }

  static async getActiveOrderCountByStoreIds(
    db: OrderDbClient,
    storeIds: string[],
  ): Promise<Map<string, number>> {
    const uniqueStoreIds = Array.from(new Set(storeIds));
    if (uniqueStoreIds.length === 0) {
      return new Map<string, number>();
    }

    const grouped = await db.order.groupBy({
      by: ["storeId"],
      where: {
        storeId: { in: uniqueStoreIds },
        status: { in: ACTIVE_STORE_ORDER_STATUSES },
      },
      _count: { _all: true },
    });

    const result = new Map<string, number>();
    for (const row of grouped) {
      result.set(row.storeId, row._count._all);
    }

    return result;
  }

  static canAcceptNewOrder(activeOrderCount: number, maxActiveOrdersPerStore: number): boolean {
    return activeOrderCount < maxActiveOrdersPerStore;
  }

  static canAssignExistingOrderToStore(params: {
    candidateStoreId: string;
    currentOrderStoreId: string;
    activeOrderCount: number;
    maxActiveOrdersPerStore: number;
  }): boolean {
    if (params.candidateStoreId === params.currentOrderStoreId) {
      return true;
    }

    return this.canAcceptNewOrder(params.activeOrderCount, params.maxActiveOrdersPerStore);
  }
}
