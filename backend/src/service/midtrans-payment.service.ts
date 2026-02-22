import { prisma } from "../lib/db/prisma";
import { BadRequestError } from "../error/BadRequestError";
import type { PrismaClient } from "../../prisma/generated/client";

/**
 * MidtransPaymentService handles Midtrans payment gateway operations
 * - Create Midtrans charges
 * - Handle Midtrans webhooks
 */
export class MidtransPaymentService {
  private static parseNamedDiscountAmount(discountNames: string[], key: string): number {
    const prefix = `${key}:`;

    return discountNames.reduce((total, name) => {
      if (!name.startsWith(prefix)) return total;

      const rawAmount = Number(name.slice(prefix.length));
      if (!Number.isFinite(rawAmount)) return total;

      return total + Math.max(0, Math.round(rawAmount));
    }, 0);
  }

  private static allocateLineTotals(
    lines: Array<{ id: string; name: string; gross: number }>,
    targetTotal: number,
  ): Array<{ id: string; name: string; price: number; quantity: number }> {
    const safeTargetTotal = Math.max(0, Math.round(targetTotal));
    const normalizedLines = lines
      .map((line) => ({
        id: line.id,
        name: line.name,
        gross: Math.max(0, Math.round(line.gross)),
      }))
      .filter((line) => line.gross > 0);

    if (safeTargetTotal === 0) {
      return [];
    }

    if (normalizedLines.length === 0) {
      return [{ id: "order_total", name: "Order Total", price: safeTargetTotal, quantity: 1 }];
    }

    const grossTotal = normalizedLines.reduce((sum, line) => sum + line.gross, 0);
    if (grossTotal <= 0) {
      return [{ id: "order_total", name: "Order Total", price: safeTargetTotal, quantity: 1 }];
    }

    const withAllocation = normalizedLines.map((line, index) => {
      const proportional = (line.gross * safeTargetTotal) / grossTotal;
      const base = Math.floor(proportional);
      return {
        index,
        id: line.id,
        name: line.name,
        price: base,
        fractional: proportional - base,
      };
    });

    let remainder = safeTargetTotal - withAllocation.reduce((sum, line) => sum + line.price, 0);

    withAllocation
      .slice()
      .sort((a, b) => {
        if (b.fractional !== a.fractional) return b.fractional - a.fractional;
        return a.index - b.index;
      })
      .forEach((line) => {
        if (remainder <= 0) return;
        line.price += 1;
        remainder -= 1;
      });

    return withAllocation
      .filter((line) => line.price > 0)
      .map((line) => ({
        id: line.id,
        name: line.name,
        price: line.price,
        quantity: 1,
      }));
  }

  private static buildMidtransItemDetails(order: {
    grandTotal: number;
    shippingCost: number;
    discountNames: string[];
    orderItems: Array<{ productId: string; productName: string; unitPrice: number; quantity: number }>;
  }): Array<{ id: string; name: string; price: number; quantity: number }> {
    const grossAmount = Math.max(0, Math.round(order.grandTotal));
    const shippingCost = Math.max(0, Math.round(order.shippingCost));

    const legacyProductItems = order.orderItems
      .map((item) => ({
        id: item.productId,
        name: item.productName,
        price: Math.max(0, Math.round(item.unitPrice)),
        quantity: Math.max(0, Math.round(item.quantity)),
      }))
      .filter((item) => item.price > 0 && item.quantity > 0);
    const legacyItems = [
      ...legacyProductItems,
      ...(shippingCost > 0
        ? [
            {
              id: "shipping",
              name: "Shipping Cost",
              price: shippingCost,
              quantity: 1,
            },
          ]
        : []),
    ];
    const legacyTotal = legacyItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (legacyTotal === grossAmount) {
      return legacyItems;
    }

    const shippingDiscount = Math.min(
      shippingCost,
      this.parseNamedDiscountAmount(order.discountNames, "SHIPPING_DISCOUNT"),
    );
    const netShippingCost = Math.max(0, shippingCost - shippingDiscount);

    const productLines = order.orderItems.map((item) => ({
      id: item.productId,
      name: item.productName,
      gross: Math.max(0, Math.round(item.unitPrice * item.quantity)),
    }));

    const targetProductTotal = grossAmount - netShippingCost;
    if (targetProductTotal >= 0) {
      const productItems = this.allocateLineTotals(productLines, targetProductTotal);
      if (netShippingCost <= 0) {
        return productItems;
      }
      return [
        ...productItems,
        {
          id: "shipping",
          name: "Shipping Cost",
          price: netShippingCost,
          quantity: 1,
        },
      ];
    }

    const fallbackLines = [
      ...productLines,
      ...(shippingCost > 0
        ? [
            {
              id: "shipping",
              name: "Shipping Cost",
              gross: shippingCost,
            },
          ]
        : []),
    ];

    return this.allocateLineTotals(fallbackLines, grossAmount);
  }

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

    // Midtrans requires gross_amount to match sum(item_details) exactly.
    const itemDetails = this.buildMidtransItemDetails({
      grandTotal: order.grandTotal,
      shippingCost: order.shippingCost,
      discountNames: order.discountNames,
      orderItems: order.orderItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      })),
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
      // Note: MidtransService.handleWebhook() can return: CANCELLED (for deny/cancel/expire), PAYMENT_PENDING, PROCESSING (for settlement/capture), or REFUND
      // Only cancel on terminal failure statuses; PAYMENT_PENDING is interim and should be no-op
      if (orderStatus === "CANCELLED") {
        // Only update if still pending (idempotency)
        if (order.status === "PAYMENT_PENDING" || order.status === "PAYMENT_WAITING_CONFIRMATION") {
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

      // Handle interim PAYMENT_PENDING status - no-op, keep order pending
      if (orderStatus === "PAYMENT_PENDING") {
        console.info(`[MidtransPaymentService] Order ${orderId} payment still pending (interim Midtrans status)`);
        return;
      }

      // Handle refund status - mark order for potential refund processing
      if (orderStatus === "REFUND") {
        if (order.status === "PROCESSING") {
          const { OrderAdminService } = await import("./order-admin.service");
          try {
            await OrderAdminService.adminCancelOrder(
              orderId,
              "Refund processed by payment gateway",
            );
          } catch (error) {
            // Idempotency guard for concurrent refund webhooks.
            if (
              !(error instanceof BadRequestError) ||
              !String(error.message).includes("no longer in PROCESSING")
            ) {
              throw error;
            }
          }
          await db.order.update({
            where: { id: orderId },
            data: {
              refundRequired: true,
              refundReason: "Refund processed by payment gateway",
            },
          });
        } else if (
          order.status === "PAYMENT_PENDING" ||
          order.status === "PAYMENT_WAITING_CONFIRMATION"
        ) {
          await db.order.update({
            where: { id: orderId },
            data: {
              status: "CANCELLED",
              refundRequired: true,
              refundReason: "Refund processed by payment gateway",
              cancelledAt: new Date(),
            },
          });
        } else {
          // Avoid invalid status rollback (e.g. SHIPPED/COMPLETED); keep status and log refund flag.
          await db.order.update({
            where: { id: orderId },
            data: {
              refundRequired: true,
              refundReason: "Refund processed by payment gateway",
            },
          });
        }

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
