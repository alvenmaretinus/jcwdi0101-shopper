import type { PrismaClient } from "../../prisma/generated/client";
import { prisma } from "../lib/db/prisma";
import { BadRequestError } from "../error/BadRequestError";

/**
 * PaymentService: Handles payment-related operations
 * Responsibilities:
 * - Upload payment proof (bank transfer)
 * - Reject payment proof
 * - Get bank info
 * - Handle Midtrans webhooks
 * - Create Midtrans charges
 */
export class PaymentService {
  private static readonly BANK_NAME = process.env.BANK_NAME || "BCA";
  private static readonly BANK_ACCOUNT_NUMBER = process.env.BANK_ACCOUNT_NUMBER || "1234567890";
  private static readonly BANK_ACCOUNT_HOLDER = process.env.BANK_ACCOUNT_HOLDER || "PT. Shopper Indonesia";
  private static readonly BANK_CODE = process.env.BANK_CODE || "bca";

  // Upload payment proof for bank transfer
  static async uploadPaymentProof(orderId: string, userId: string, proofPath: string) {
    const db: PrismaClient = prisma;
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      throw new BadRequestError("Order not found");
    }

    if (order.userId !== userId) {
      throw new BadRequestError("Unauthorized - order does not belong to user");
    }

    if (order.status !== "PAYMENT_PENDING") {
      throw new BadRequestError("Order is not waiting for payment proof");
    }

    if (order.paymentType !== "BANK_TRANSFER") {
      throw new BadRequestError("This order is not for bank transfer payment");
    }

    // Check if payment deadline has passed
    if (order.paymentDueAt && new Date() > order.paymentDueAt) {
      throw new BadRequestError("Payment deadline has passed. Order was cancelled.");
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        paymentProofUrl: proofPath,
        status: "PAYMENT_WAITING_CONFIRMATION",
      },
      include: { orderItems: true, user: true },
    });

    console.info(`[PaymentService] Payment proof uploaded for order ${orderId}`);
    return updated;
  }

  // Reject payment proof - admin rejects proof, user can re-upload
  static async rejectPaymentProof(orderId: string, reason: string) {
    const db: PrismaClient = prisma;
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestError("Order not found");
    }

    if (order.status !== "PAYMENT_WAITING_CONFIRMATION") {
      throw new BadRequestError("Order is not waiting for payment confirmation");
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        status: "PAYMENT_PENDING",
        paymentProofUrl: null,
      },
      include: { orderItems: true },
    });

    console.info(`[PaymentService] rejected payment proof for order ${orderId}. Reason: ${reason}`);
    return updated;
  }

  // Get bank information for bank transfer
  static async getBankInfo() {
    return {
      bankName: this.BANK_NAME,
      accountNumber: this.BANK_ACCOUNT_NUMBER,
      accountHolder: this.BANK_ACCOUNT_HOLDER,
      bankCode: this.BANK_CODE,
    };
  }

  // Handle Midtrans webhook callback with support for multiple payment statuses
  static async handleMidtransWebhook(webhookData: any) {
    const db: PrismaClient = prisma;
    const { MidtransService } = await import("./midtrans.service");

    try {
      // Process webhook data
      const processedData = await MidtransService.handleWebhook(webhookData);
      const { orderId, shouldConfirmPayment, orderStatus } = processedData;

      console.info(`[PaymentService] Processing Midtrans webhook for order ${orderId}, status: ${orderStatus}`);

      // Get current order
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true, user: true },
      });

      if (!order) {
        console.error(`[PaymentService] Order ${orderId} not found for webhook - possible data inconsistency`);
        return;
      }

      // Handle payment success (settlement/capture) - decrement stock and move to PROCESSING
      if (shouldConfirmPayment) {
        const { OrderLifecycleService } = await import("./order-lifecycle.service");
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

          console.info(`[PaymentService] Order ${orderId} cancelled from Midtrans webhook (status: ${orderStatus})`);
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

        console.info(`[PaymentService] Order ${orderId} refunded from Midtrans - marked for refund processing`);
        return;
      }

      console.info(`[PaymentService] Order ${orderId} webhook processed, status: ${orderStatus}`);
    } catch (error) {
      console.error("[PaymentService] Error handling Midtrans webhook:", error);
      throw error;
    }
  }

  // Create Midtrans charge for PAYMENT_GATEWAY orders
  static async createMidtransCharge(orderId: string) {
    const db: PrismaClient = prisma;
    const { MidtransService } = await import("./midtrans.service");

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true, user: true },
    });

    if (!order) {
      throw new BadRequestError("Order not found");
    }

    if (order.status !== "PAYMENT_PENDING") {
      throw new BadRequestError("Order is not waiting for payment");
    }

    if (order.paymentType !== "PAYMENT_GATEWAY") {
      throw new BadRequestError("This order is not for payment gateway");
    }

    if (!order.user?.email || !order.user?.name) {
      throw new BadRequestError("User email and name required for payment gateway");
    }

    // Prepare item details for Midtrans
    const itemDetails = order.orderItems.map((item: any) => ({
      id: item.productId,
      name: item.productName,
      price: item.unitPrice,
      quantity: item.quantity,
    }));

    // Add shipping as separate item
    itemDetails.push({
      id: "SHIPPING",
      name: "Shipping Cost",
      price: order.shippingCost,
      quantity: 1,
    });

    // Create charge via Midtrans
    const transaction = await MidtransService.createCharge(orderId, order.grandTotal, order.user.email, order.user.name, itemDetails);

    console.info(`[PaymentService] Midtrans charge created for order ${orderId}`);
    return transaction;
  }
}
