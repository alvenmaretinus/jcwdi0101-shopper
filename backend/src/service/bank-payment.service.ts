import { prisma } from "../lib/db/prisma";
import { BadRequestError } from "../error/BadRequestError";
import { UnauthorizedError } from "../error/UnauthorizedError";
import type { PrismaClient } from "../../prisma/generated/client";

/**
 * BankPaymentService handles bank transfer payment operations
 * - Upload payment proof with validation
 * - Reject payment proof
 * - Get bank information
 */
export class BankPaymentService {
  /**
   * Upload payment proof image for bank transfer order
   * @param orderId Order ID
   * @param userId User ID (for authorization)
   * @param proofPath Path to uploaded payment proof file
   * @returns Updated order with PAYMENT_WAITING_CONFIRMATION status
   * @throws BadRequestError if order not PAYMENT_PENDING or payment deadline passed
   */
  static async uploadPaymentProof(orderId: string, userId: string, proofPath: string) {
    const db: PrismaClient = prisma;

    // Verify order exists and belongs to user
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestError("Order not found");
    }
    if (order.userId !== userId) {
      throw new UnauthorizedError("Unauthorized - order does not belong to user");
    }

    // Order must be PAYMENT_PENDING
    if (order.status !== "PAYMENT_PENDING") {
      throw new BadRequestError(`Cannot upload proof for order with status ${order.status}`);
    }

    // Order must be bank transfer payment type
    if (order.paymentType !== "BANK_TRANSFER") {
      throw new BadRequestError("This order does not support bank transfer payment. Payment type: " + order.paymentType);
    }

    // Check if payment deadline has passed (auto-expire if needed)
    if (order.paymentDueAt && new Date() > order.paymentDueAt) {
      await db.order.update({ where: { id: orderId }, data: { status: "CANCELLED" } });
      throw new BadRequestError("Payment deadline has passed. Order cancelled.");
    }

    // Store proof and change status to waiting for admin confirmation
    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        paymentProofUrl: proofPath,
        status: "PAYMENT_WAITING_CONFIRMATION",
      },
    });

    return updated;
  }

  /**
   * Reject payment proof and allow user to re-upload
   * @param orderId Order ID
   * @param rejectionReason Optional rejection reason for audit trail
   * @param adminId Optional admin ID for authorization check
   * @param adminStoreId Optional admin store ID for store-scoped authorization
   * @returns Updated order with PAYMENT_PENDING status
   */
  static async rejectPaymentProof(orderId: string, rejectionReason?: string, adminId?: string, adminStoreId?: string) {
    const db: PrismaClient = prisma;

    // Verify order exists
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new BadRequestError("Order not found");
    }

    // If admin provided, verify they own the store (unless they are SUPERADMIN)
    if (adminId && adminStoreId) {
      const admin = await db.user.findUnique({ where: { id: adminId } });
      if (admin?.role === "ADMIN" && admin.storeId !== order.storeId) {
        throw new UnauthorizedError("You can only reject proofs for orders from your own store");
      }
    }

    // Order must be PAYMENT_WAITING_CONFIRMATION
    if (order.status !== "PAYMENT_WAITING_CONFIRMATION") {
      throw new BadRequestError(`Cannot reject proof for order with status ${order.status}. Order must be in PAYMENT_WAITING_CONFIRMATION status.`);
    }

    // Reset to PAYMENT_PENDING, allowing user to re-upload
    const updated = await db.order.update({
      where: { id: orderId },
      data: {
        paymentProofUrl: null,
        status: "PAYMENT_PENDING",
      },
    });

    console.info(`[BankPaymentService] Rejected payment proof for order ${orderId}. Reason: ${rejectionReason || "N/A"}`);

    return updated;
  }

  /**
   * Get bank account information for frontend display
   * @returns Bank account details
   */
  static async getBankInfo() {
    return {
      bankName: process.env.BANK_NAME || "Bank Transfer",
      accountNumber: process.env.BANK_ACCOUNT_NUMBER || "xxxx-xxxx-xxxx",
      accountHolder: process.env.BANK_ACCOUNT_HOLDER || "PT. Shopper Indonesia",
      bankCode: process.env.BANK_CODE || "bca",
    };
  }
}
