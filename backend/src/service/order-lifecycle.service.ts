import { prisma } from "../lib/db/prisma";
import { BadRequestError } from "../error/BadRequestError";
import type { PrismaClient, Prisma } from "../../prisma/generated/client";
import { getDistance } from "geolib";
import { PricingCalculationService } from "./pricing-calculation.service";
import { StoreOrderCapacityService } from "./store-order-capacity.service";
import { OrderRewardService } from "./order-reward.service";

type StoreWithDistance = {
  store: any;
  distanceKm: number;
};

/**
 * OrderLifecycleService handles core order lifecycle transitions
 * - Confirm payment: decrement stock + move to PROCESSING
 * - Ship order: mark as shipped
 * - Confirm delivery: mark as delivered
 * - Cancel order: user cancellation
 */
export class OrderLifecycleService {
  private static async getVoucherFreeQuantityMap(
    db: PrismaClient,
    params: {
      orderSubtotal: number;
      orderUserId: string;
      voucherIdentifiers: string[];
      items: Array<{ productId: string; quantity: number }>;
    },
  ): Promise<Record<string, number>> {
    const voucherIdentifiers = params.voucherIdentifiers.map((identifier) => identifier.trim()).filter((identifier) => identifier.length > 0);

    if (voucherIdentifiers.length === 0) {
      return {};
    }

    const vouchers = await db.voucher.findMany({
      where: {
        isSoftDeleted: false,
        OR: [{ id: { in: voucherIdentifiers } }, { code: { in: voucherIdentifiers } }],
        discount: {
          isSoftDeleted: false,
        },
      },
      include: {
        discount: {
          select: {
            id: true,
            type: true,
            buyQuantity: true,
            freeQuantity: true,
            isTiedToProduct: true,
            productId: true,
            startsAt: true,
            endsAt: true,
            isWithMinimum: true,
            minimumPrice: true,
            isQuantityLimited: true,
            maxUses: true,
            useCounter: true,
            hasDiscountAmountCap: true,
            maxDiscountAmount: true,
          },
        },
      },
    });

    if (vouchers.length === 0) {
      return {};
    }

    const itemByProductId = new Map<string, { productId: string; quantity: number }>();
    for (const item of params.items) {
      itemByProductId.set(item.productId, item);
    }

    const freeQuantityMap: Record<string, number> = {};

    for (const voucher of vouchers) {
      if (voucher.userId !== null && voucher.userId !== params.orderUserId) {
        continue;
      }

      const discount = voucher.discount;
      if (discount.type !== "QUANTITY") {
        continue;
      }

      if (!discount.isTiedToProduct || !discount.productId) {
        continue;
      }

      if (!discount.buyQuantity || !discount.freeQuantity) {
        continue;
      }

      const item = itemByProductId.get(discount.productId);
      if (!item) {
        continue;
      }

      const setsEligible = Math.floor(item.quantity / discount.buyQuantity);
      const freeItems = setsEligible * discount.freeQuantity;
      if (freeItems <= 0) {
        continue;
      }

      freeQuantityMap[discount.productId] = (freeQuantityMap[discount.productId] ?? 0) + freeItems;
    }

    return freeQuantityMap;
  }

  private static async redeemAppliedVouchers(
    tx: Prisma.TransactionClient,
    params: {
      userId: string;
      voucherIdentifiers: string[];
    },
  ) {
    const voucherIdentifiers = params.voucherIdentifiers.map((identifier) => identifier.trim()).filter((identifier) => identifier.length > 0);
    const normalizedVoucherIdentifiers = Array.from(new Set(voucherIdentifiers.map((identifier) => identifier.toLowerCase())));

    if (normalizedVoucherIdentifiers.length === 0) {
      return;
    }

    const vouchers = await tx.voucher.findMany({
      where: {
        isSoftDeleted: false,
        OR: [
          { id: { in: voucherIdentifiers } },
          ...voucherIdentifiers.map((identifier) => ({
            code: { equals: identifier, mode: "insensitive" as const },
          })),
        ],
        discount: {
          isSoftDeleted: false,
        },
      },
      include: {
        discount: {
          select: {
            id: true,
            isQuantityLimited: true,
            maxUses: true,
          },
        },
      },
    });

    if (vouchers.length === 0) {
      throw new BadRequestError("Applied voucher is invalid or unavailable during payment confirmation.");
    }

    const matchedVoucherKeys = new Set<string>();
    vouchers.forEach((voucher) => {
      matchedVoucherKeys.add(voucher.id.toLowerCase());
      matchedVoucherKeys.add(voucher.code.toLowerCase());
    });

    const unresolvedIdentifiers = normalizedVoucherIdentifiers.filter((identifier) => !matchedVoucherKeys.has(identifier));
    if (unresolvedIdentifiers.length > 0) {
      throw new BadRequestError(`Applied voucher could not be resolved: ${unresolvedIdentifiers.join(", ")}`);
    }

    const unauthorizedVoucher = vouchers.find((voucher) => voucher.userId !== null && voucher.userId !== params.userId);
    if (unauthorizedVoucher) {
      throw new BadRequestError("Assigned voucher does not belong to this user");
    }

    // Voucher redemption is tracked via the discount's useCounter, which is incremented below.
    // No need to update voucher record - the discount usage tracking handles it.

    const limitedDiscountIds = Array.from(new Set(vouchers.filter((voucher) => voucher.discount.isQuantityLimited && voucher.discount.maxUses !== null).map((voucher) => voucher.discount.id)));

    await Promise.all(
      limitedDiscountIds.map((discountId) =>
        tx.discount.updateMany({
          where: {
            id: discountId,
            isQuantityLimited: true,
            maxUses: { not: null },
            useCounter: {
              lt: tx.discount.fields.maxUses as any,
            },
          },
          data: {
            useCounter: { increment: 1 },
          },
        }),
      ),
    );
  }

  private static extractLimitedNonVoucherDiscountIds(discountNames: string[] | null | undefined): string[] {
    if (!discountNames || discountNames.length === 0) {
      return [];
    }

    const entry = discountNames.find((name) => name.startsWith("NON_VOUCHER_LIMITED_IDS:"));
    if (!entry) {
      return [];
    }

    const rawValue = entry.slice("NON_VOUCHER_LIMITED_IDS:".length);
    if (!rawValue) {
      return [];
    }

    const ids = rawValue
      .split(",")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    return Array.from(new Set(ids));
  }

  private static async incrementAppliedNonVoucherDiscountCounters(tx: Prisma.TransactionClient, discountNames: string[] | null | undefined) {
    const discountIds = this.extractLimitedNonVoucherDiscountIds(discountNames);
    for (const discountId of discountIds) {
      const updateResult = await tx.discount.updateMany({
        where: {
          id: discountId,
          isSoftDeleted: false,
          isVoucher: false,
          isQuantityLimited: true,
          maxUses: { not: null },
          useCounter: {
            lt: tx.discount.fields.maxUses as any,
          },
        },
        data: {
          useCounter: { increment: 1 },
        },
      });

      if (updateResult.count === 0) {
        throw new BadRequestError("Discount quota reached during payment confirmation. Please checkout again.");
      }
    }
  }

  private static extractQuantityBonusByProductId(
    discountNames: string[] | null | undefined,
    prefix: string,
  ): Record<string, number> {
    const result: Record<string, number> = {};
    if (!discountNames || discountNames.length === 0) {
      return result;
    }

    const token = discountNames.find((name) => name.startsWith(prefix));
    if (!token) {
      return result;
    }

    const rawValue = token.slice(prefix.length);
    if (!rawValue) {
      return result;
    }

    rawValue.split("|").forEach((entry) => {
      const [productIdRaw, freeQtyRaw] = entry.split(":");
      const productId = (productIdRaw ?? "").trim();
      const freeQty = Math.max(0, Number(freeQtyRaw) || 0);

      if (!productId || freeQty <= 0) {
        return;
      }

      result[productId] = (result[productId] ?? 0) + freeQty;
    });

    return result;
  }

  private static hasAnyPositiveQuantity(quantityMap: Record<string, number>): boolean {
    return Object.values(quantityMap).some((value) => Number(value) > 0);
  }

  /**
   * Confirm payment - decrement stock atomically and move to PROCESSING
   * @param orderId Order ID to confirm
   * @returns Updated order
   * @throws BadRequestError if order not found or stock insufficient
   * @note Idempotent: safe for concurrent webhook calls
   */
  static async confirmPayment(orderId: string) {
    const db: PrismaClient = prisma;
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true, user: true },
    });

    if (!order) throw new BadRequestError("Order not found");

    // Note: Idempotency check moved inside transaction (line ~115) to avoid race condition window.
    // This ensures that concurrent webhook calls don't both pass checks and enter transaction logic.

    // Support both PAYMENT_PENDING (gateway) and PAYMENT_WAITING_CONFIRMATION (bank transfer proof uploaded)
    const validStatuses = ["PAYMENT_PENDING", "PAYMENT_WAITING_CONFIRMATION"];
    if (!validStatuses.includes(order.status)) {
      throw new BadRequestError(`Cannot confirm payment for order with status ${order.status}. Only PAYMENT_PENDING or PAYMENT_WAITING_CONFIRMATION orders can be confirmed.`);
    }

    const items = order.orderItems.map((oi) => ({
      productId: oi.productId,
      quantity: oi.quantity,
    }));

    let bogoFreeQuantityMap = this.extractQuantityBonusByProductId(
      order.discountNames,
      "PROMO_QTY_BONUSES:",
    );
    let voucherFreeQuantityMap = this.extractQuantityBonusByProductId(
      order.discountNames,
      "VOUCHER_QTY_BONUSES:",
    );

    const userAddress = await db.userAddress.findUnique({
      where: { id: order.userAddressId },
    });

    const stores = await db.store.findMany();
    const storesWithDistance: StoreWithDistance[] = stores
      .map((store) => ({
        store,
        distanceKm:
          getDistance(
            {
              latitude: Number(userAddress?.latitude ?? 0),
              longitude: Number(userAddress?.longitude ?? 0),
            },
            { latitude: store.latitude, longitude: store.longitude },
          ) / 1000,
      }))
      .filter((s) => s.distanceKm <= 5)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    if (storesWithDistance.length === 0) {
      await db.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
      throw new BadRequestError("No store within 5 km can fulfill the entire order.");
    }

    const maxActiveOrdersPerStore = StoreOrderCapacityService.getMaxActiveOrdersPerStore();
    const activeOrderCountByStoreId = await StoreOrderCapacityService.getActiveOrderCountByStoreIds(
      db,
      storesWithDistance.map((s) => s.store.id),
    );

    const productIds = items.map((i) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true },
    });
    const productMap: Record<string, any> = {};
    for (const p of products) productMap[p.id] = p;

    // Fallback for legacy orders created before quantity-bonus tokens were persisted.
    if (!this.hasAnyPositiveQuantity(bogoFreeQuantityMap)) {
      const promotionBreakdown = await PricingCalculationService.calculateProductPromotionBreakdown(
        items.map((it) => ({
          productId: it.productId,
          quantity: it.quantity,
          unitPrice: productMap[it.productId]?.price ?? 0,
        })),
        db,
      );

      for (const line of promotionBreakdown.lines) {
        bogoFreeQuantityMap[line.productId] = line.bogoFreeQuantity;
      }
    }

    // Fallback for legacy orders without voucher quantity token.
    if (!this.hasAnyPositiveQuantity(voucherFreeQuantityMap)) {
      voucherFreeQuantityMap = await this.getVoucherFreeQuantityMap(db, {
        orderSubtotal: order.subtotal,
        orderUserId: order.userId,
        voucherIdentifiers: order.voucherCodes,
        items,
      });
    }
    // Try candidate stores (nearest first)
    for (const candidate of storesWithDistance) {
      const store = candidate.store;
      const activeOrderCount = activeOrderCountByStoreId.get(store.id) ?? 0;
      if (
        !StoreOrderCapacityService.canAssignExistingOrderToStore({
          candidateStoreId: store.id,
          currentOrderStoreId: order.storeId,
          activeOrderCount,
          maxActiveOrdersPerStore,
        })
      ) {
        continue;
      }

      // Batch load productStore records for this store to avoid N+1 query
      const storeProducts = await db.productStore.findMany({
        where: {
          storeId: store.id,
          productId: { in: productIds },
        },
      });
      const psMap: Record<string, any> = {};
      for (const ps of storeProducts) psMap[ps.productId] = ps;

      // Check if all items can be fulfilled (including promo and voucher bonus items)
      let canFulfill = true;
      for (const it of items) {
        const ps = psMap[it.productId];
        const bogoFreeQuantity = bogoFreeQuantityMap[it.productId] ?? 0;
        const voucherFreeQuantity = voucherFreeQuantityMap[it.productId] ?? 0;
        const totalQuantityNeeded = it.quantity + bogoFreeQuantity + voucherFreeQuantity;

        if (!ps || ps.quantity < totalQuantityNeeded) {
          canFulfill = false;
          break;
        }
      }
      if (!canFulfill) continue;

      try {
        const result = await db.$transaction(async (tx: Prisma.TransactionClient) => {
          // Double-check order status inside transaction (race condition safety)
          const txOrder = await tx.order.findUnique({
            where: { id: orderId },
          });
          if (!["PAYMENT_PENDING", "PAYMENT_WAITING_CONFIRMATION"].includes(txOrder?.status ?? "")) {
            throw new BadRequestError("Order already processed or cancelled");
          }

          if (store.id !== order.storeId) {
            const latestActiveOrderCount = await StoreOrderCapacityService.getActiveOrderCountByStoreId(tx, store.id);
            if (!StoreOrderCapacityService.canAcceptNewOrder(latestActiveOrderCount, maxActiveOrdersPerStore)) {
              throw new BadRequestError("STORE_CAPACITY_FULL");
            }
          }

          const endingStockByProductId = new Map<string, number>();

          // Atomically decrement stock (including promo and voucher bonus items)
          for (const it of items) {
            const bogoFreeQuantity = bogoFreeQuantityMap[it.productId] ?? 0;
            const voucherFreeQuantity = voucherFreeQuantityMap[it.productId] ?? 0;
            const totalQuantityToDeduct = it.quantity + bogoFreeQuantity + voucherFreeQuantity;

            const upd = await tx.productStore.updateMany({
              where: {
                productId: it.productId,
                storeId: store.id,
                quantity: { gte: totalQuantityToDeduct },
              },
              data: { quantity: { decrement: totalQuantityToDeduct } },
            });
            if (upd.count === 0) throw new BadRequestError("Stock changed during confirmation");

            const productStoreAfterDeduction = await tx.productStore.findFirst({
              where: {
                productId: it.productId,
                storeId: store.id,
              },
              select: { quantity: true },
            });

            endingStockByProductId.set(it.productId, productStoreAfterDeduction?.quantity ?? 0);
          }

          // Update order status to PROCESSING and store info if store changed
          const updateData: any = { status: "PROCESSING" };
          if (store.id !== order.storeId) {
            console.info(`[OrderLifecycleService] Order ${orderId} store changed from ${order.storeId} to ${store.id} at confirmation`);

            // Recalculate shipping cost for the new store to ensure correct total
            const distanceKm = storesWithDistance.find((s) => s.store.id === store.id)?.distanceKm ?? 0;
            const costPerKm = 1000;
            let newShippingCost = Math.ceil(distanceKm * costPerKm);

            try {
              const { ShippingCostService } = await import("./shipping-cost.service");
              const userAddress = await db.userAddress.findUnique({ where: { id: order.userAddressId } });
              const scInput = {
                originPostCode: String(store.postCode ?? ""),
                destinationPostCode: String(userAddress?.postCode ?? ""),
                weight: 1,
                itemValue: order.subtotal,
              };
              const scData = await ShippingCostService.getShippingCost(scInput);
              const option = scData.calculate_reguler?.[0] ?? scData.calculate_instant?.[0] ?? scData.calculate_cargo?.[0];
              newShippingCost = option?.shipping_cost_net ?? newShippingCost;
            } catch (err) {
              console.warn(`[OrderLifecycleService] Shipping cost recalculation failed for order ${orderId}, using fallback, error: ${err}`);
            }

            // Update store info and recalculated shipping cost
            updateData.storeId = store.id;
            updateData.storeAddress = store.addressName;
            updateData.storeName = store.name;
            updateData.shippingCost = newShippingCost;
            updateData.grandTotal = order.subtotal + newShippingCost - order.totalDiscount;
          }

          const updated = await tx.order.update({
            where: { id: orderId },
            data: updateData,
          });

          // Record product movement for audit trail (including promo and voucher bonus items)
          for (const it of items) {
            const bogoFreeQuantity = bogoFreeQuantityMap[it.productId] ?? 0;
            const voucherFreeQuantity = voucherFreeQuantityMap[it.productId] ?? 0;
            const totalQuantityToDeduct = it.quantity + bogoFreeQuantity + voucherFreeQuantity;

            await tx.productMovement.create({
              data: {
                orderId,
                quantityChange: -totalQuantityToDeduct,
                movementType: "SOLD",
                productId: it.productId,
                fromStoreId: store.id,
                description: process.env.PRODUCT_MOVEMENT_SOLD_MESSAGE || "Stock deducted after payment confirmation",
                endStock: endingStockByProductId.get(it.productId) ?? 0,
              },
            });
          }

          // Clear user's cart after successful confirmation - only items from this order
          const userCart = await tx.cart.findUnique({
            where: { userId: order.userId },
          });
          if (userCart && items.length > 0) {
            await tx.cartItem.deleteMany({
              where: {
                cartId: userCart.id,
                productId: { in: items.map((it) => it.productId) },
                // Keep new cart changes added after checkout creation.
                updatedAt: { lte: order.createdAt },
              },
            });
          }

          await this.redeemAppliedVouchers(tx, {
            userId: order.userId,
            voucherIdentifiers: order.voucherCodes,
          });
          await this.incrementAppliedNonVoucherDiscountCounters(tx, order.discountNames);

          return updated;
        });

        return result;
      } catch (err) {
        if (err instanceof BadRequestError) {
          const retryableErrors = new Set(["STORE_CAPACITY_FULL", "Stock changed during confirmation"]);
          if (retryableErrors.has(err.message)) {
            continue;
          }
        }
        throw err;
      }
    }

    // Could not fulfill from any store - mark for refund
    const refundReason = "No store within 5 km can fulfill the entire order after payment approval or store capacity is full";
    await db.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        refundRequired: true,
        refundReason,
        cancelledAt: new Date(),
      },
    });
    console.error(`[OrderLifecycleService] Order ${orderId} marked for refund - ${refundReason}`);
    throw new BadRequestError(refundReason);
  }

  /**
   * User cancels order (only PAYMENT_PENDING status allowed)
   * @param orderId Order ID to cancel
   * @param userId User ID (for authorization)
   * @returns Updated order
   * @throws BadRequestError if order not in PAYMENT_PENDING status
   */
  static async cancelOrder(orderId: string, userId: string) {
    const db: PrismaClient = prisma;
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new BadRequestError("Order not found");
    }

    if (order.userId !== userId) {
      throw new BadRequestError("Unauthorized - order does not belong to user");
    }

    if (order.status !== "PAYMENT_PENDING") {
      throw new BadRequestError(`Cannot cancel order with status ${order.status}. Only PAYMENT_PENDING orders can be cancelled.`);
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });

    // Decrement discount and voucher usage counters
    const { OrderService } = await import("./order.service");
    await OrderService.decrementAppliedDiscountCounters(userId, db, order.appliedDiscountIds, order.voucherCodes);

    return updated;
  }

  /**
   * Admin marks order as shipped
   */
  static async shipOrder(orderId: string) {
    const db: PrismaClient = prisma;
    const order = await db.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new BadRequestError("Order not found");
    }

    if (order.status !== "PROCESSING") {
      throw new BadRequestError(`Cannot ship order with status ${order.status}. Only PROCESSING orders can be shipped.`);
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        status: "SHIPPED",
        shippedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * User confirms order completion
   */
  static async confirmOrder(orderId: string, userId: string) {
    const db: PrismaClient = prisma;
    const now = new Date();

    return db.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });

      if (!order) {
        throw new BadRequestError("Order not found");
      }

      if (order.userId !== userId) {
        throw new BadRequestError("Unauthorized - order does not belong to user");
      }

      if (order.status !== "SHIPPED") {
        throw new BadRequestError(`Cannot confirm order with status ${order.status}. Only SHIPPED orders can be confirmed.`);
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: "COMPLETED",
          deliveredAt: now,
          confirmedAt: now,
        },
      });

      const rewardResult = await OrderRewardService.grantCompletionRewardVoucher(tx, {
        id: updated.id,
        userId: updated.userId,
        subtotal: updated.subtotal,
      });

      if (rewardResult.granted) {
        console.info(`[OrderLifecycleService] Reward voucher granted for completed order ${updated.id}: ${rewardResult.voucherCode}`);
      }

      return updated;
    });
  }

  /**
   * Admin cancel order - delegates to admin service
   */
  static async adminCancelOrder(orderId: string, reason?: string) {
    const { OrderAdminService } = await import("./order-admin.service");
    return OrderAdminService.adminCancelOrder(orderId, reason);
  }

  /**
   * Auto-deliver orders - delegates to admin service (cron job)
   */
  static async autoDeliverOrders() {
    const { OrderAdminService } = await import("./order-admin.service");
    return OrderAdminService.autoDeliverOrders();
  }

  /**
   * Auto-complete orders - delegates to admin service (cron job)
   */
  static async autoCompleteOrders() {
    const { OrderAdminService } = await import("./order-admin.service");
    return OrderAdminService.autoCompleteOrders();
  }

  /**
   * Backward-compatible alias for older call sites
   * @deprecated Use autoDeliverOrders()
   */
  static async autoConfirmOrders() {
    const { OrderAdminService } = await import("./order-admin.service");
    return OrderAdminService.autoConfirmOrders();
  }

  /**
   * Expire pending orders - delegates to admin service (cron job)
   */
  static async expirePendingOrders() {
    const { OrderAdminService } = await import("./order-admin.service");
    return OrderAdminService.expirePendingOrders();
  }
}
