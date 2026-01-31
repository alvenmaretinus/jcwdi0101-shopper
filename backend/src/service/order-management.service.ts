import { prisma } from "../lib/db/prisma";
import type { PrismaClient, Prisma } from "../../prisma/generated/client";
import { BadRequestError } from "../error/BadRequestError";

/**
 * OrderManagementService: Handles order lifecycle operations
 * Responsibilities:
 * - Confirm payment (stock decrement)
 * - Ship order
 * - Confirm delivery (user)
 * - Auto-confirm orders (cron)
 * - Expire pending orders (cron)
 * - Admin cancel order (with refund)
 */
export class OrderManagementService {
  // Confirm payment and decrement stock (atomic transaction)
  static async confirmPayment(orderId: string) {
    const db: PrismaClient = prisma;
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new BadRequestError("Order not found");
    }

    if (order.status !== "PAYMENT_PENDING" && order.status !== "PAYMENT_WAITING_CONFIRMATION") {
      throw new BadRequestError(`Cannot confirm payment for order with status ${order.status}`);
    }

    // Atomic transaction: validate stock + decrement + create movements
    try {
      await db.$transaction(async (tx: any) => {
        // Validate all items have sufficient stock
        for (const item of order.orderItems) {
          const updated = await tx.productStore.updateMany({
            where: {
              productId: item.productId,
              storeId: order.storeId,
              quantity: { gte: item.quantity }, // Check in WHERE clause
            },
            data: { quantity: { decrement: item.quantity } },
          });

          if (updated.count === 0) {
            throw new BadRequestError("No store within 5 km can fulfill the entire order after payment approval");
          }
        }

        // Create product movements for audit trail
        for (const item of order.orderItems) {
          await tx.productMovement.create({
            data: {
              productId: item.productId,
              productName: item.productName,
              productCategory: item.productCategory,
              quantityChange: -item.quantity,
              movementType: "SOLD",
            },
          });
        }

        // Update order to PROCESSING
        await tx.order.update({
          where: { id: orderId },
          data: { status: "PROCESSING" },
        });

        // Clear user's cart
        const user = await tx.user.findUnique({ where: { id: order.userId } });
        if (user?.id) {
          const cart = await tx.cart.findUnique({ where: { userId: user.id } });
          if (cart?.id) {
            await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
          }
        }
      });

      console.info(`[OrderManagementService] Payment confirmed for order ${orderId}, stock decremented`);
    } catch (error) {
      const refundReason = error instanceof Error ? error.message : "Stock validation failed";
      await db.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          refundRequired: true,
          refundReason,
          cancelledAt: new Date(),
        },
      });
      console.error(`[OrderManagementService] Order ${orderId} marked for refund - ${refundReason}`);
      throw new BadRequestError(refundReason);
    }

    return await db.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });
  }

  // Admin marks order as shipped
  static async shipOrder(orderId: string) {
    const db: PrismaClient = prisma;
    const order = await db.order.findUnique({ where: { id: orderId } });

    if (!order) {
      throw new BadRequestError("Order not found");
    }

    if (order.status !== "PROCESSING") {
      throw new BadRequestError(`Cannot ship order with status ${order.status}`);
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        status: "SHIPPED",
        shippedAt: new Date(),
      },
      include: { orderItems: true },
    });

    console.info(`[OrderManagementService] Order ${orderId} marked as shipped`);
    return updated;
  }

  // User confirms delivery
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
      throw new BadRequestError(`Cannot confirm order with status ${order.status}. Order must be SHIPPED first.`);
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
      include: { orderItems: true },
    });

    console.info(`[OrderManagementService] Order ${orderId} confirmed as delivered by user`);
    return updated;
  }

  // Auto-confirm orders after 48 hours
  static async autoConfirmOrders() {
    const db: PrismaClient = prisma;
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const result = await db.order.updateMany({
      where: {
        status: "SHIPPED",
        shippedAt: { lt: twoDaysAgo },
      },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
    });

    if (result.count > 0) {
      console.info(`[OrderManagementService] auto-confirmed ${result.count} orders past 48 hours`);
    }

    return result;
  }

  // Expire pending orders that are past paymentDueAt
  static async expirePendingOrders() {
    const db: PrismaClient = prisma;
    const now = new Date();

    const expiredOrders = await db.order.updateMany({
      where: {
        status: "PAYMENT_PENDING",
        paymentDueAt: { lt: now },
      },
      data: { status: "CANCELLED" },
    });

    if (expiredOrders.count > 0) {
      console.info(`[OrderManagementService] expired ${expiredOrders.count} pending orders past paymentDueAt`);
    }

    return expiredOrders;
  }

  // Admin cancel order with stock refund
  static async adminCancelOrder(orderId: string, reason?: string) {
    const db: PrismaClient = prisma;
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      throw new BadRequestError("Order not found");
    }

    // Can cancel any status except SHIPPED, DELIVERED, or already CANCELLED
    const cancellableStatuses = ["PAYMENT_PENDING", "PAYMENT_WAITING_CONFIRMATION", "PROCESSING"];
    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestError(`Cannot cancel order with status ${order.status}. Admin can only cancel orders before they are shipped.`);
    }

    // If order was PAYMENT_WAITING_CONFIRMATION or PROCESSING, need to refund stock
    if (["PAYMENT_WAITING_CONFIRMATION", "PROCESSING"].includes(order.status)) {
      await db.$transaction(async (tx: any) => {
        const orderItems = await tx.orderItem.findMany({
          where: { orderId },
        });

        // Refund each item's stock
        for (const item of orderItems) {
          // Increment stock back to store
          await tx.productStore.updateMany({
            where: { productId: item.productId, storeId: order.storeId },
            data: { quantity: { increment: item.quantity } },
          });

          // Create ProductMovement record for audit trail
          await tx.productMovement.create({
            data: {
              productId: item.productId,
              productName: item.productName,
              productCategory: item.productCategory,
              quantityChange: item.quantity, // Positive = returned
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

      console.info(`[OrderManagementService] Admin cancelled order ${orderId} (status was ${order.status}), stock refunded. Reason: ${reason || "No reason provided"}`);
    } else {
      // For PAYMENT_PENDING, just mark as cancelled (no stock to refund)
      await db.order.update({
        where: { id: orderId },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });

      console.info(`[OrderManagementService] Admin cancelled order ${orderId} (status was PAYMENT_PENDING). Reason: ${reason || "No reason provided"}`);
    }

    // Return updated order
    const updated = await db.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    return updated;
  }
}
