import type { PrismaClient } from "../../prisma/generated/client";
import { OrderCheckoutService } from "./order/order-checkout.service";
import { OrderDiscountCounterService } from "./order/order-discount-counter.service";

export class OrderService {
  static async decrementAppliedDiscountCounters(
    userId: string,
    db: PrismaClient,
    discountIds?: string[],
    voucherIds?: string[],
  ) {
    return OrderDiscountCounterService.decrementAppliedDiscountCounters(
      userId,
      db,
      discountIds,
      voucherIds,
    );
  }

  static async getCheckoutShippingInfo(userId: string, addressId: string) {
    return OrderCheckoutService.getCheckoutShippingInfo(userId, addressId);
  }

  static async getCheckoutPricingBreakdown(
    userId: string,
    addressId: string,
    voucherIds?: string[],
    discountIds?: string[],
    shippingCost?: number,
  ) {
    return OrderCheckoutService.getCheckoutPricingBreakdown(
      userId,
      addressId,
      voucherIds,
      discountIds,
      shippingCost,
    );
  }

  static async createPendingOrder(
    userId: string,
    addressId: string,
    paymentType: "BANK_TRANSFER" | "PAYMENT_GATEWAY" = "BANK_TRANSFER",
    voucherIds?: string[],
    discountIds?: string[],
    selectedShippingCost?: number,
    selectedShippingMethod?: string,
  ) {
    return OrderCheckoutService.createPendingOrder(
      userId,
      addressId,
      paymentType,
      voucherIds,
      discountIds,
      selectedShippingCost,
      selectedShippingMethod,
    );
  }

  static async confirmPayment(orderId: string) {
    const { OrderLifecycleService } = await import("./order-lifecycle.service");
    return OrderLifecycleService.confirmPayment(orderId);
  }

  static async expirePendingOrders() {
    const { OrderLifecycleService } = await import("./order-lifecycle.service");
    return OrderLifecycleService.expirePendingOrders();
  }

  static async uploadPaymentProof(orderId: string, userId: string, proofPath: string) {
    const { BankPaymentService } = await import("./bank-payment.service");
    return BankPaymentService.uploadPaymentProof(orderId, userId, proofPath);
  }

  static async rejectPaymentProof(
    orderId: string,
    rejectionReason?: string,
    adminId?: string,
    adminStoreId?: string,
  ) {
    const { BankPaymentService } = await import("./bank-payment.service");
    return BankPaymentService.rejectPaymentProof(
      orderId,
      rejectionReason,
      adminId,
      adminStoreId,
    );
  }

  static async getBankInfo() {
    const { BankPaymentService } = await import("./bank-payment.service");
    return BankPaymentService.getBankInfo();
  }

  static async getOrders(
    userId: string,
    userRole: string,
    storeId?: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
    sortBy: "createdAt" | "status" = "createdAt",
    sortOrder: "asc" | "desc" = "desc",
    dateFrom?: string,
    dateTo?: string,
    search?: string,
  ) {
    const { OrderQueryService } = await import("./order-query.service");
    return OrderQueryService.getOrders(
      userId,
      userRole,
      storeId,
      page,
      limit,
      status,
      sortBy,
      sortOrder,
      dateFrom,
      dateTo,
      search,
    );
  }

  static async getOrderById(orderId: string, userId?: string, storeId?: string) {
    const { OrderQueryService } = await import("./order-query.service");
    return OrderQueryService.getOrderById(orderId, userId, storeId);
  }

  static async cancelOrder(orderId: string, userId: string) {
    const { OrderLifecycleService } = await import("./order-lifecycle.service");
    return OrderLifecycleService.cancelOrder(orderId, userId);
  }

  static async adminCancelOrder(orderId: string, reason?: string) {
    const { OrderLifecycleService } = await import("./order-lifecycle.service");
    return OrderLifecycleService.adminCancelOrder(orderId, reason);
  }

  static async shipOrder(orderId: string) {
    const { OrderLifecycleService } = await import("./order-lifecycle.service");
    return OrderLifecycleService.shipOrder(orderId);
  }

  static async confirmOrder(orderId: string, userId: string) {
    const { OrderLifecycleService } = await import("./order-lifecycle.service");
    return OrderLifecycleService.confirmOrder(orderId, userId);
  }

  static async autoDeliverOrders() {
    const { OrderLifecycleService } = await import("./order-lifecycle.service");
    return OrderLifecycleService.autoDeliverOrders();
  }

  static async autoCompleteOrders() {
    const { OrderLifecycleService } = await import("./order-lifecycle.service");
    return OrderLifecycleService.autoCompleteOrders();
  }

  static async autoConfirmOrders() {
    return this.autoDeliverOrders();
  }

  static async createMidtransCharge(orderId: string) {
    const { MidtransPaymentService } = await import("./midtrans-payment.service");
    return MidtransPaymentService.createMidtransCharge(orderId);
  }

  static async handleMidtransWebhook(webhookData: any) {
    const { MidtransPaymentService } = await import("./midtrans-payment.service");
    return MidtransPaymentService.handleMidtransWebhook(webhookData);
  }
}
