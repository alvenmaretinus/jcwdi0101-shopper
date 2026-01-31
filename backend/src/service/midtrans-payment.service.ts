import { prisma } from "../lib/db/prisma";
import { BadRequestError } from "../error/BadRequestError";
import type { PrismaClient } from "../../prisma/generated/client";

/**
 * MidtransPaymentService handles Midtrans payment gateway operations
 * - Create Midtrans charges
 * - Handle Midtrans webhooks
 */
export class MidtransPaymentService {
  /**
   * Create Midtrans payment charge for PAYMENT_GATEWAY order
   * @param orderId Order ID
   * @returns Midtrans transaction response (transactionId, token, paymentUrl)
   * @throws BadRequestError if order not found, invalid status, or invalid payment type
   * @note Generates transaction token for frontend Snap popup
   * @security Validates order status and payment type before creating charge
   */
  static async createMidtransCharge(orderId: string) {
    const db: PrismaClient = prisma;
    const { MidtransService } = await import("./midtrans.service");

    // Get order details
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true, user: true },
    });

    if (!order) {
      throw new BadRequestError("Order not found");
    }

    if (order.status !== "PAYMENT_PENDING") {
      throw new BadRequestError(`Order status must be PAYMENT_PENDING, current: ${order.status}`);
    }

    if (order.paymentType !== "PAYMENT_GATEWAY") {
      throw new BadRequestError("This order is not using payment gateway");
    }

    if (!order.user?.email || !order.user?.name) {
      throw new BadRequestError("User email and name are required");
    }

    // Prepare item details for Midtrans
    const itemDetails = order.orderItems.map((item) => ({
      id: item.productId,
      name: item.productName,
      price: item.unitPrice,
      quantity: item.quantity,
    }));

    // Add shipping cost as item
    itemDetails.push({
      id: "shipping",
      name: "Shipping Cost",
      price: order.shippingCost,
      quantity: 1,
    });

    try {
      // Create Midtrans transaction
      const transaction = await MidtransService.createCharge(orderId, order.grandTotal, order.user.email, order.user.name, itemDetails);

      console.info(`[MidtransPaymentService] Midtrans charge created for order ${orderId}, transaction: ${transaction.transactionId}`);

      return transaction;
    } catch (error) {
      console.error(`[MidtransPaymentService] Failed to create Midtrans charge for order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Handle Midtrans webhook notification
   * @param webhookData Midtrans webhook payload
   * @returns Processing result
   * @throws Error if webhook processing fails
   * @note Handles: settlement, failure, cancellation, expiry, refund statuses
   * @security Signature verified by MidtransService.handleWebhook()
   * @desc Auto-confirms payment on settlement, cancels on failure/expiry, marks refunds
   */
  static async handleMidtransWebhook(webhookData: any) {
    const db: PrismaClient = prisma;
    const { MidtransService } = await import("./midtrans.service");
    const { OrderLifecycleService } = await import("./order-lifecycle.service");

    try {
      // Process webhook data
      const processedData = await MidtransService.handleWebhook(webhookData);
      const { orderId, shouldConfirmPayment, orderStatus } = processedData;

      console.info(`[MidtransPaymentService] Processing Midtrans webhook for order ${orderId}, status: ${orderStatus}`);

      // Get current order
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true, user: true },
      });

      if (!order) {
        console.error(`[MidtransPaymentService] ⚠️ Order ${orderId} not found for webhook - possible data inconsistency or fraud attempt`);
        return;
      }

      // Handle payment success (settlement/capture) - decrement stock and move to PROCESSING
      if (shouldConfirmPayment) {
        return await OrderLifecycleService.confirmPayment(orderId);
      }

      // Handle payment failure/cancellation/expiry - mark order as cancelled
      if (orderStatus === "CANCELLED" || orderStatus === "EXPIRE" || orderStatus === "PENDING") {
        // Only update if still pending (idempotency)
        if (order.status === "PAYMENT_PENDING") {
          await db.order.update({
            where: { id: orderId },
            data: {
              status: "CANCELLED",
              cancelledAt: new Date(),
            },
          });

          console.info(`[MidtransPaymentService] Order ${orderId} cancelled from Midtrans webhook (status: ${orderStatus})`);
        }
        return;
      }

      // Handle refund status - mark order for potential refund processing
      if (orderStatus === "REFUND") {
        await db.order.update({
          where: { id: orderId },
          data: {
            status: "CANCELLED",
            refundRequired: true,
            refundReason: "Refund processed by payment gateway",
            cancelledAt: new Date(),
          },
        });

        console.info(`[MidtransPaymentService] Order ${orderId} refunded from Midtrans - marked for refund processing`);
        return;
      }

      // For other statuses, just log
      console.info(`[MidtransPaymentService] Order ${orderId} webhook processed, status: ${orderStatus}`);
    } catch (error) {
      console.error("[MidtransPaymentService] Error handling Midtrans webhook:", error);
      throw error;
    }
  }
}
