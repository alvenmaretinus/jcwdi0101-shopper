import { prisma } from "../lib/db/prisma";
import { BadRequestError } from "../error/BadRequestError";
import type { PrismaClient, Prisma, OrderItem } from "../../prisma/generated/client";
import { MovementType } from "../../prisma/generated/client";
import { OrderRewardService } from "./order-reward.service";

/**
 * OrderAdminService handles admin-specific order operations
 * - Admin cancel order with stock refund
 * - Auto-deliver + auto-complete orders (cron)
 * - Expire pending orders (cron)
 */
export class OrderAdminService {
  private static async buildRestockEntries(
    tx: Prisma.TransactionClient,
    orderId: string,
    fallbackStoreId: string,
    fallbackOrderItems: OrderItem[],
  ) {
    const soldMovements = await tx.productMovement.findMany({
      where: {
        orderId,
        movementType: MovementType.SOLD,
      },
      select: {
        productId: true,
        quantityChange: true,
        fromStoreId: true,
      },
    });

    const normalizedFromMovements = soldMovements
      .filter((movement) => movement.quantityChange < 0)
      .map((movement) => ({
        productId: movement.productId,
        storeId: movement.fromStoreId ?? fallbackStoreId,
        quantity: Math.abs(movement.quantityChange),
      }));

    const sourceEntries =
      normalizedFromMovements.length > 0
        ? normalizedFromMovements
        : fallbackOrderItems.map((item) => ({
            productId: item.productId,
            storeId: fallbackStoreId,
            quantity: item.quantity,
          }));

    const aggregated = new Map<string, { productId: string; storeId: string; quantity: number }>();

    for (const entry of sourceEntries) {
      if (entry.quantity <= 0) continue;
      const key = `${entry.productId}:${entry.storeId}`;
      const existing = aggregated.get(key);
      if (existing) {
        existing.quantity += entry.quantity;
        continue;
      }

      aggregated.set(key, { ...entry });
    }

    return Array.from(aggregated.values());
  }

  /**
   * Admin cancels order with automatic stock refund if applicable
   * @param orderId Order ID to cancel
   * @param reason Optional reason for cancellation (logged)
   * @returns Updated order with CANCELLED status
   * @throws BadRequestError if order not found or already shipped
   * @note Automatically refunds stock for PROCESSING orders
   * @access Private (Admin)
   */
  static async adminCancelOrder(orderId: string, reason?: string) {
    const db: PrismaClient = prisma;
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new BadRequestError("Order not found");
    }

    const cancellableStatuses = ["PAYMENT_PENDING", "PAYMENT_WAITING_CONFIRMATION", "PROCESSING"];
    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestError(`Cannot cancel order with status ${order.status}. Admin can only cancel orders before they are shipped.`);
    }

    // If order was PROCESSING, need to refund stock
    // (PAYMENT_WAITING_CONFIRMATION: stock was never decremented, so no refund needed)
    if (["PROCESSING"].includes(order.status)) {
      await db.$transaction(async (tx) => {
        // Atomically claim cancellation to prevent double-restock on concurrent requests.
        const claimed = await tx.order.updateMany({
          where: {
            id: orderId,
            status: "PROCESSING",
          },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
          },
        });
        if (claimed.count === 0) {
          throw new BadRequestError("Order is no longer in PROCESSING status");
        }

        const orderItems = await tx.orderItem.findMany({
          where: { orderId },
        });

        const restockEntries = await this.buildRestockEntries(
          tx,
          orderId,
          order.storeId,
          orderItems,
        );

        // Refund stock based on SOLD movement history (fallback to order item qty when no movement found)
        for (const entry of restockEntries) {
          const updatedStock = await tx.productStore.updateMany({
            where: {
              productId: entry.productId,
              storeId: entry.storeId,
            },
            data: { quantity: { increment: entry.quantity } },
          });

          let endingStock = entry.quantity;
          if (updatedStock.count === 0) {
            const createdProductStore = await tx.productStore.create({
              data: {
                productId: entry.productId,
                storeId: entry.storeId,
                quantity: entry.quantity,
              },
            });
            endingStock = createdProductStore.quantity;
          } else {
            const productStore = await tx.productStore.findFirst({
              where: {
                productId: entry.productId,
                storeId: entry.storeId,
              },
              select: { quantity: true },
            });
            endingStock = productStore?.quantity ?? entry.quantity;
          }

          // Create ProductMovement record for audit trail
          await tx.productMovement.create({
            data: {
              orderId,
              productId: entry.productId,
              quantityChange: entry.quantity,
              movementType: MovementType.CANCELED,
              toStoreId: entry.storeId,
              description: reason
                ? `Stock restored from cancelled order: ${reason}`
                : "Stock restored from cancelled order",
              endStock: endingStock,
            },
          });
        }
      });

      console.info(`[OrderAdminService] Admin cancelled order ${orderId} (status was ${order.status}), stock refunded. Reason: ${reason || "No reason provided"}`);
    } else {
      // For PAYMENT_PENDING or PAYMENT_WAITING_CONFIRMATION, just mark as cancelled (no stock to refund)
      // But if PAYMENT_WAITING_CONFIRMATION + BANK_TRANSFER, mark for manual refund
      const needsRefund = order.status === "PAYMENT_WAITING_CONFIRMATION" && order.paymentType === "BANK_TRANSFER";

      await db.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          refundRequired: needsRefund,
          refundReason: needsRefund ? `Manual refund needed - ${reason || "Admin cancelled order"}` : undefined,
        },
      });

      console.info(`[OrderAdminService] Admin cancelled order ${orderId} (status was ${order.status}). Reason: ${reason || "No reason provided"}`);
    }

    // Return updated order
    const updated = await db.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    return updated;
  }

  /**
   * Auto-deliver orders after shipping window
   * @returns Result with count of auto-delivered orders
   * @note Scheduled cron job - runs automatically
   * @desc Sets status to DELIVERED when shippedAt > configured days (default: 2)
   */
  static async autoDeliverOrders() {
    const db: PrismaClient = prisma;
    const days = Number(process.env.AUTO_DELIVER_DAYS ?? 2);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const deliveredOrders = await db.order.updateMany({
      where: {
        status: "SHIPPED",
        shippedAt: { lt: cutoff },
      },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });

    if (deliveredOrders.count > 0) {
      console.info(`[OrderAdminService] auto-delivered ${deliveredOrders.count} orders past ${days}-day shipping window`);
    }

    return deliveredOrders;
  }

  /**
   * Auto-complete delivered orders after shipping window
   * @returns Result with count of auto-completed orders
   * @note Scheduled cron job - runs automatically
   * @desc Sets status to COMPLETED when shippedAt > configured days (default: 7)
   */
  static async autoCompleteOrders() {
    const db: PrismaClient = prisma;
    const days = Number(process.env.AUTO_COMPLETE_DAYS ?? 7);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const candidates = await db.order.findMany({
      where: {
        status: "DELIVERED",
        shippedAt: { lt: cutoff },
      },
      select: {
        id: true,
        userId: true,
        subtotal: true,
      },
    });

    let completedCount = 0;
    let rewardGrantedCount = 0;

    for (const candidate of candidates) {
      const completionResult = await db.$transaction(async (tx) => {
        const claimed = await tx.order.updateMany({
          where: {
            id: candidate.id,
            status: "DELIVERED",
          },
          data: {
            status: "COMPLETED",
            confirmedAt: new Date(),
          },
        });

        if (claimed.count === 0) {
          return { completed: false, rewardGranted: false };
        }

        const rewardResult = await OrderRewardService.grantCompletionRewardVoucher(tx, {
          id: candidate.id,
          userId: candidate.userId,
          subtotal: candidate.subtotal,
        });

        return { completed: true, rewardGranted: rewardResult.granted };
      });

      if (completionResult.completed) {
        completedCount += 1;
      }
      if (completionResult.rewardGranted) {
        rewardGrantedCount += 1;
      }
    }

    const completedOrders = {
      count: completedCount,
      rewardGrantedCount,
    };

    if (completedOrders.count > 0) {
      console.info(
        `[OrderAdminService] auto-completed ${completedOrders.count} orders past ${days}-day shipping window, granted ${completedOrders.rewardGrantedCount} reward vouchers`,
      );
    }

    return completedOrders;
  }

  /**
   * Backward-compatible alias for older call sites
   * @deprecated Use autoDeliverOrders()
   */
  static async autoConfirmOrders() {
    return this.autoDeliverOrders();
  }

  /**
   * Expire pending payment orders past deadline
   * @returns Result with count of expired orders
   * @note Scheduled cron job - runs automatically
   * @desc Marks PAYMENT_PENDING orders as CANCELLED when paymentDueAt passed
   */
  static async expirePendingOrders() {
    const now = new Date();
    const db: PrismaClient = prisma;

    const expiredOrders = await db.order.updateMany({
      where: {
        status: "PAYMENT_PENDING",
        paymentDueAt: { lt: now },
      },
      data: { status: "CANCELLED" },
    });

    if (expiredOrders.count > 0) {
      console.info(`[OrderAdminService] expired ${expiredOrders.count} pending orders past paymentDueAt`);
    }

    return expiredOrders;
  }
}
