import midtransClient from "midtrans-client";
import crypto from "crypto";
import { BadRequestError } from "../error/BadRequestError";

export class MidtransService {
  private static snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true" || false,
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
  });

  private static coreApi = new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true" || false,
    serverKey: process.env.MIDTRANS_SERVER_KEY || "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
  });

  /**
   * Create Midtrans transaction/charge
   * @param orderId Order ID (unique transaction ID)
   * @param amount Total amount to charge (grandTotal)
   * @param customerEmail Customer email address
   * @param customerName Customer full name
   * @param itemDetails Array of items (id, price, quantity, name)
   * @returns Transaction details (transactionId, token, redirectUrl, status)
   * @throws BadRequestError if Midtrans API fails
   * @desc Creates transaction in Midtrans Snap and returns token for frontend
   * @security Uses serverKey from environment variables
   */
  static async createCharge(orderId: string, amount: number, customerEmail: string, customerName: string, itemDetails: Array<{ id: string; price: number; quantity: number; name: string }>) {
    try {
      const transactionDetails = {
        transaction_details: {
          order_id: orderId,
          gross_amount: amount,
        },
        customer_details: {
          email: customerEmail,
          first_name: customerName.trim().split(" ")[0] || customerName,
          last_name: customerName.trim().split(" ").slice(1).join(" ") || customerName.trim().split(" ")[0],
        },
        item_details: itemDetails.map((item) => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity,
          name: item.name,
        })),
      };

      const transaction = await this.snap.createTransaction(transactionDetails);

      return {
        transactionId: transaction.transaction_id,
        orderId: orderId,
        redirectUrl: transaction.redirect_url,
        token: transaction.token,
        amount: amount,
        status: transaction.transaction_status,
      };
    } catch (error: any) {
      console.error("[MidtransService] Error creating charge:", error);
      throw new BadRequestError(`Midtrans charge creation failed: ${error.message}`);
    }
  }

  /**
   * Handle Midtrans webhook notification
   * @param notificationData Webhook payload from Midtrans
   * @returns Processed transaction details (orderId, orderStatus, shouldConfirmPayment)
   * @throws BadRequestError if webhook processing fails
   * @note Maps Midtrans status (settlement/capture/pending/deny/cancel/expire) to app status
   * @security Signature should be verified by caller before processing
   */
  static async handleWebhook(notificationData: any) {
    try {
      const orderId = notificationData.order_id;
      const transactionStatus = notificationData.transaction_status;
      const fraudStatus = notificationData.fraud_status;

      console.info(`[MidtransService] Webhook received for order ${orderId}, status: ${transactionStatus}`);

      // Map Midtrans status to order status
      let orderStatus = "";
      let shouldConfirmPayment = false;

      switch (transactionStatus) {
        case "settlement":
        case "capture":
          // Payment successful
          orderStatus = "PROCESSING";
          shouldConfirmPayment = true;
          break;

        case "pending":
          // Payment pending (waiting for customer to complete payment)
          orderStatus = "PAYMENT_PENDING";
          break;

        case "deny":
        case "cancel":
        case "expire":
          // Payment failed/cancelled
          orderStatus = "CANCELLED";
          break;

        case "refund":
          // Payment refunded
          orderStatus = "REFUND";
          break;

        default:
          orderStatus = "";
      }

      return {
        orderId,
        transactionId: notificationData.transaction_id,
        transactionStatus,
        fraudStatus,
        orderStatus,
        shouldConfirmPayment,
        transactionData: notificationData,
      };
    } catch (error: any) {
      console.error("[MidtransService] Error handling webhook:", error);
      throw new BadRequestError(`Webhook processing failed: ${error.message}`);
    }
  }

  /**
   * Get transaction status from Midtrans
   * @param transactionId Midtrans transaction ID
   * @returns Transaction status details (transactionId, orderId, status, amount, acquiredAt)
   * @throws BadRequestError if API call fails
   * @desc Used for polling transaction status if webhook unreliable
   */
  static async getTransactionStatus(transactionId: string) {
    try {
      const status = await this.coreApi.transaction.status(transactionId);

      return {
        transactionId: status.transaction_id,
        orderId: status.order_id,
        status: status.transaction_status,
        amount: status.gross_amount,
        acquiredAt: status.transaction_time,
      };
    } catch (error: any) {
      console.error("[MidtransService] Error getting transaction status:", error);
      throw new BadRequestError(`Failed to get transaction status: ${error.message}`);
    }
  }

  /**
   * Verify Midtrans webhook signature (security)
   * @param orderId Order ID from webhook
   * @param statusCode Status code from webhook
   * @param grossAmount Gross amount from webhook
   * @param signature Signature from webhook header
   * @returns true if signature valid, false otherwise
   * @desc SHA512 hash verification using serverKey
   * @security CRITICAL: Verify before trusting webhook data
   */
  static verifyWebhookSignature(orderId: string, statusCode: string, grossAmount: string, signature: string): boolean {
    try {
      const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
      const data = orderId + statusCode + grossAmount + serverKey;

      // Create hash using SHA512
      const calculatedHash = crypto.createHash("sha512").update(data).digest("hex");

      return calculatedHash === signature;
    } catch (error) {
      console.error("[MidtransService] Error verifying signature:", error);
      return false;
    }
  }
}
