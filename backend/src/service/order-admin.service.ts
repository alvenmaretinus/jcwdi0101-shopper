import { prisma } from "../lib/db/prisma";
import { BadRequestError } from "../error/BadRequestError";
import type { PrismaClient } from "../../prisma/generated/client";

/**
 * OrderAdminService handles admin-specific order operations
 * - Admin cancel order with stock refund
 * - Auto-confirm orders (cron)
 * - Expire pending orders (cron)
 */
export class OrderAdminService {
  /**
   * Admin cancels order with automatic stock refund if applicable
   * @param orderId Order ID to cancel
   * @param reason Optional reason for cancellation (logged)
   * @returns Updated order with CANCELLED status
   * @throws BadRequestError if order not found or already shipped
   * @note Automatically refunds stock for PROCESSING/PAYMENT_WAITING_CONFIRMATION orders
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

    // If order was PAYMENT_WAITING_CONFIRMATION or PROCESSING, need to refund stock
    if (["PAYMENT_WAITING_CONFIRMATION", "PROCESSING"].includes(order.status)) {
      await db.$transaction(async (tx) => {
        const orderItems = await tx.orderItem.findMany({
          where: { orderId },
        });

        // Refund each item's stock
        for (const item of orderItems) {
          await tx.productStore.updateMany({
            where: {
              productId: item.productId,
              storeId: order.storeId,
            },
            data: { quantity: { increment: item.quantity } },
          });

          // Create ProductMovement record for audit trail
          await tx.productMovement.create({
            data: {
              productId: item.productId,
              productName: item.productName,
              productCategory: item.productCategory,
              quantityChange: item.quantity,
              movementType: "CANCELED",
              createdAt: new Date(),
            },
          });
        }

        // Update order status to CANCELLED
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
          },
        });
      });

      console.info(`[OrderAdminService] Admin cancelled order ${orderId} (status was ${order.status}), stock refunded. Reason: ${reason || "No reason provided"}`);
    } else {
      // For PAYMENT_PENDING, just mark as cancelled (no stock to refund)
      await db.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });

      console.info(`[OrderAdminService] Admin cancelled order ${orderId} (status was PAYMENT_PENDING). Reason: ${reason || "No reason provided"}`);
    }

    // Return updated order
    const updated = await db.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    return updated;
  }

  /**
   * Auto-confirm orders 2 days after shipping
   * @returns Result with count of auto-confirmed orders
   * @note Scheduled cron job - runs automatically
   * @desc Sets status to DELIVERED when shippedAt > 2 days ago
   */
  static async autoConfirmOrders() {
    const db: PrismaClient = prisma;
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const confirmedOrders = await db.order.updateMany({
      where: {
        status: "SHIPPED",
        shippedAt: { lt: twoDaysAgo },
      },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });

    if (confirmedOrders.count > 0) {
      console.info(`[OrderAdminService] auto-confirmed ${confirmedOrders.count} orders past 2-day shipping window`);
    }

    return confirmedOrders;
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
