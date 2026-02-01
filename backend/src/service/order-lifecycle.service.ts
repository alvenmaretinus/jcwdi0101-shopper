import { prisma } from "../lib/db/prisma";
import { BadRequestError } from "../error/BadRequestError";
import type { PrismaClient, Prisma } from "../../prisma/generated/client";
import { getDistance } from "geolib";

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

    const productIds = items.map((i) => i.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      include: { category: true },
    });
    const productMap: Record<string, any> = {};
    for (const p of products) productMap[p.id] = p;

    // Try candidate stores (nearest first)
    for (const candidate of storesWithDistance) {
      const store = candidate.store;

      // Batch load productStore records for this store to avoid N+1 query
      const storeProducts = await db.productStore.findMany({
        where: {
          storeId: store.id,
          productId: { in: productIds },
        },
      });
      const psMap: Record<string, any> = {};
      for (const ps of storeProducts) psMap[ps.productId] = ps;

      // Check if all items can be fulfilled
      let canFulfill = true;
      for (const it of items) {
        const ps = psMap[it.productId];
        if (!ps || ps.quantity < it.quantity) {
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

          // Atomically decrement stock
          for (const it of items) {
            const upd = await tx.productStore.updateMany({
              where: {
                productId: it.productId,
                storeId: store.id,
                quantity: { gte: it.quantity },
              },
              data: { quantity: { decrement: it.quantity } },
            });
            if (upd.count === 0) throw new BadRequestError("Stock changed during confirmation");
          }

          // Update order status to PROCESSING and store info if store changed
          const updateData: any = { status: "PROCESSING" };
          if (store.id !== order.storeId) {
            console.info(`[OrderLifecycleService] Order ${orderId} store changed from ${order.storeId} to ${store.id} at confirmation`);
            updateData.storeId = store.id;
            updateData.storeAddress = store.addressName;
            updateData.storeName = store.name;
          }

          const updated = await tx.order.update({
            where: { id: orderId },
            data: updateData,
          });

          // Record product movement for audit trail
          for (const it of items) {
            const p = productMap[it.productId];
            await tx.productMovement.create({
              data: {
                quantityChange: -it.quantity,
                productName: p?.name ?? "",
                productCategory: p?.category?.category ?? "",
                movementType: "SOLD",
                productId: it.productId,
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
              },
            });
          }

          return updated;
        });

        return result;
      } catch (err) {
        if (err instanceof BadRequestError) continue;
        throw err;
      }
    }

    // Could not fulfill from any store - mark for refund
    const refundReason = "No store within 5 km can fulfill the entire order after payment approval";
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
   * User confirms delivery
   */
  static async confirmOrder(orderId: string, userId: string) {
    const db: PrismaClient = prisma;
    const order = await db.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new BadRequestError("Order not found");
    }

    if (order.userId !== userId) {
      throw new BadRequestError("Unauthorized - order does not belong to user");
    }

    if (order.status !== "SHIPPED") {
      throw new BadRequestError(`Cannot confirm order with status ${order.status}. Only SHIPPED orders can be confirmed.`);
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Admin cancel order - delegates to admin service
   */
  static async adminCancelOrder(orderId: string, reason?: string) {
    const { OrderAdminService } = await import("./order-admin.service");
    return OrderAdminService.adminCancelOrder(orderId, reason);
  }

  /**
   * Auto-confirm orders - delegates to admin service (cron job)
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
