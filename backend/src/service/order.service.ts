import { prisma } from "../lib/db/prisma";
import { CartRepository } from "../repository/cart.repository";
import { BadRequestError } from "../error/BadRequestError";
import { getDistance } from "geolib";
import { ShippingCostService } from "./shipping-cost.service";
import { GetShippingCostInput } from "../schema/shipping-cost/GetShippingCostSchema";
import type { PrismaClient, Prisma, Store } from "../../prisma/generated/client";

type StoreWithDistance = {
  store: Store;
  distanceKm: number;
};

export class OrderService {
  /**
   * Create a pending order (checkout)
   * @param userId User ID
   * @param addressId Shipping address ID
   * @param paymentType Payment method (BANK_TRANSFER or PAYMENT_GATEWAY)
   * @param voucherIds Optional array of voucher IDs to apply discounts
   * @returns Created order
   * @throws BadRequestError if address invalid, cart empty, or no store within 5km can fulfill
   * @note Sets payment deadline based on PAYMENT_DUE_HOURS env variable (default: 1 hour)
   * @note Vouchers are ranked by highest amount first for discount calculation
   */
  static async createPendingOrder(userId: string, addressId: string, paymentType: "BANK_TRANSFER" | "PAYMENT_GATEWAY" = "BANK_TRANSFER", voucherIds?: string[]) {
    const address = await prisma.userAddress.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== userId) {
      throw new BadRequestError("SHIPPING_ADDRESS_REQUIRED");
    }

    const cart = await CartRepository.findCartWithItemsAndProduct(userId);
    if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
      throw new BadRequestError("Cart is empty.");
    }

    const items = cart.cartItems.map((ci) => ({ productId: ci.productId, quantity: ci.quantity }));

    const db: PrismaClient = prisma;
    const stores = await db.store.findMany();
    const storesWithDistance: StoreWithDistance[] = stores
      .map((store) => ({
        store,
        distanceKm: getDistance({ latitude: Number(address.latitude), longitude: Number(address.longitude) }, { latitude: store.latitude, longitude: store.longitude }) / 1000,
      }))
      .filter((s) => s.distanceKm <= 5)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    if (storesWithDistance.length === 0) {
      throw new BadRequestError("No store within 5 km of the shipping address.");
    }

    // pick nearest store that has enough stock for all items
    // Batch load productStore records to avoid N+1 queries
    const productIds = items.map((i) => i.productId);
    let candidateStore = null as Store | null;
    for (const s of storesWithDistance) {
      const storeCandidate = s.store;

      // Batch load all productStore records for this store at once
      const storeProducts = await db.productStore.findMany({
        where: {
          storeId: storeCandidate.id,
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
      if (canFulfill) {
        candidateStore = storeCandidate;
        break;
      }
    }

    if (!candidateStore) {
      throw new BadRequestError("No store within 5 km can fulfill the entire order.");
    }

    // productIds already declared earlier (line 53)
    const products = await db.product.findMany({ where: { id: { in: productIds } }, include: { category: true } });
    type ProductWithCategory = Prisma.ProductGetPayload<{ include: { category: true } }>;
    const productMap: Record<string, ProductWithCategory | undefined> = {};
    for (const p of products as ProductWithCategory[]) productMap[p.id] = p;

    const subtotal = items.reduce((s, it) => s + (productMap[it.productId]?.price ?? 0) * it.quantity, 0);

    // Calculate distance from the selected candidateStore (not nearest) for accurate shipping cost
    const distanceKm = storesWithDistance.find((s) => s.store.id === candidateStore.id)?.distanceKm ?? 0;
    const costPerKm = 1000;

    // Calculate shipping cost using same logic as checkout
    // Try external shipping cost service first; fall back to distance * costPerKm
    let shippingCost = 0;
    try {
      const scInput: GetShippingCostInput = {
        originPostCode: String(candidateStore.postCode ?? ""),
        destinationPostCode: String(address.postCode ?? ""),
        weight: 1,
        itemValue: subtotal,
      };
      const scData = await ShippingCostService.getShippingCost(scInput);
      // prefer first available regular shipping option
      const option = scData.calculate_reguler?.[0] ?? scData.calculate_instant?.[0] ?? scData.calculate_cargo?.[0];
      shippingCost = option?.shipping_cost_net ?? Math.ceil(distanceKm * costPerKm);
    } catch (e) {
      // Log shipping service failure but don't crash - fall back to simple calculation
      console.warn(`[OrderService] Shipping cost service failed for pending order, using fallback: ${e instanceof Error ? e.message : "unknown error"}`);
      shippingCost = Math.ceil(distanceKm * costPerKm);
    }

    // Calculate voucher discount using VoucherService (ranked by highest amount first)
    let totalDiscount = 0;
    if (voucherIds && voucherIds.length > 0) {
      const { VoucherService } = await import("./voucher/voucher.service");
      const { PrismaVoucherRepository } = await import("../repository/voucher/adapter_prisma");
      const voucherRepo = new PrismaVoucherRepository(db);
      const voucherService = new VoucherService(voucherRepo);
      totalDiscount = await voucherService.calculateVoucherDiscount(voucherIds, subtotal);
    }

    const grandTotal = subtotal + shippingCost - totalDiscount;

    // create pending order snapshot; do NOT decrement stock here
    // Payment deadline: 1 hour for manual bank transfer (per brief: "sekitar 1 jam" to upload proof)
    const paymentDueHours = Number.isFinite(Number(process.env.PAYMENT_DUE_HOURS)) ? Number(process.env.PAYMENT_DUE_HOURS) : 1;
    const paymentDueAt = new Date(Date.now() + paymentDueHours * 60 * 60 * 1000);
    const order = await db.order.create({
      data: {
        subtotal,
        totalDiscount,
        shippingCost,
        grandTotal,
        status: "PAYMENT_PENDING",
        paymentType,
        shippingAddress: `${address.recipientName} - ${address.addressName} | ${address.latitude},${address.longitude} | ${address.postCode}`,
        storeAddress: candidateStore.addressName,
        storeName: candidateStore.name,
        storeId: candidateStore.id,
        userAddressId: addressId,
        paymentDueAt,
        userId,
        orderItems: {
          create: items.map((it) => ({
            quantity: it.quantity,
            unitPrice: productMap[it.productId]?.price ?? 0,
            productName: productMap[it.productId]?.name ?? "",
            productCategory: productMap[it.productId]?.category?.category ?? "",
            productId: it.productId,
          })),
        },
      },
    });

    return order;
  }

  /**
   * Confirm payment for bank transfer order
   * @param orderId Order ID
   * @returns Updated order with confirmed payment
   * @throws BadRequestError if order not found or invalid status
   * @desc Delegates to OrderLifecycleService.confirmPayment()
   */
  static async confirmPayment(orderId: string) {
    const { OrderLifecycleService } = await import("./order-lifecycle.service");
    return OrderLifecycleService.confirmPayment(orderId);
  }

  /**
   * Expire pending payment orders past deadline
   * @returns Array of expired orders
   * @desc Delegates to OrderLifecycleService.expirePendingOrders()
   * @note Admin scheduled task, triggered hourly
   */
  static async expirePendingOrders() {
    const { OrderLifecycleService } = await import("./order-lifecycle.service");
    return OrderLifecycleService.expirePendingOrders();
  }

  /**
   * Upload payment proof for bank transfer order
   * @param orderId Order ID
   * @param userId User ID (authorization)
   * @param proofPath Uploaded proof image path
   * @returns Updated order with proof URL
   * @throws UnauthorizedError if user doesn't own order
   * @throws BadRequestError if order not in PAYMENT_PENDING status
   * @desc Delegates to BankPaymentService.uploadPaymentProof()
   */
  static async uploadPaymentProof(orderId: string, userId: string, proofPath: string) {
    const { BankPaymentService } = await import("./bank-payment.service");
    return BankPaymentService.uploadPaymentProof(orderId, userId, proofPath);
  }

  /**
   * Reject payment proof and reset order to PAYMENT_PENDING
   * @param orderId Order ID
   * @param rejectionReason Optional reason for rejection
   * @param adminId Optional admin ID for authorization check
   * @param adminStoreId Optional admin store ID for store-scoped authorization
   * @returns Updated order
   * @desc Delegates to BankPaymentService.rejectPaymentProof()
   */
  static async rejectPaymentProof(orderId: string, rejectionReason?: string, adminId?: string, adminStoreId?: string) {
    const { BankPaymentService } = await import("./bank-payment.service");
    return BankPaymentService.rejectPaymentProof(orderId, rejectionReason, adminId, adminStoreId);
  }

  /**
   * Get bank account information for frontend display
   * @returns Bank details (account number, holder name)
   * @desc Delegates to BankPaymentService.getBankInfo()
   */
  static async getBankInfo() {
    const { BankPaymentService } = await import("./bank-payment.service");
    return BankPaymentService.getBankInfo();
  }

  /**
   * Get orders with role-based filtering
   * @param userId Current user ID
   * @param userRole User role (USER, STORE_ADMIN, SUPER_ADMIN)
   * @param storeId Store ID (for admins)
   * @param page Pagination page number
   * @param limit Items per page
   * @param status Filter by order status
   * @param sortBy Sort field (createdAt or status)
   * @param sortOrder Sort direction (asc or desc)
   * @param dateFrom Start date filter
   * @param dateTo End date filter
   * @param search Search in order/product names
   * @returns Paginated orders list
   * @desc Delegates to OrderQueryService.getOrders()
   */
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
    return OrderQueryService.getOrders(userId, userRole, storeId, page, limit, status, sortBy, sortOrder, dateFrom, dateTo, search);
  }

  /**
   * Get order detail by ID with authorization checks
   * @param orderId Order ID
   * @param userId User ID (validates ownership for regular users)
   * @param storeId Store ID (validates ownership for admins)
   * @returns Order with items, customer, and store details
   * @throws NotFoundError if order not found or unauthorized
   * @desc Delegates to OrderQueryService.getOrderById()
   */
  static async getOrderById(orderId: string, userId?: string, storeId?: string) {
    const { OrderQueryService } = await import("./order-query.service");
    return OrderQueryService.getOrderById(orderId, userId, storeId);
  }

  /**
   * Cancel order by user (only PAYMENT_PENDING allowed)
   * @param orderId Order ID
   * @param userId User ID (authorization)
   * @returns Updated cancelled order
   * @throws UnauthorizedError if user doesn't own order
   * @throws BadRequestError if order cannot be cancelled
   * @desc Delegates to OrderLifecycleService.cancelOrder()
   */
  static async cancelOrder(orderId: string, userId: string) {
    const { OrderLifecycleService } = await import("./order-lifecycle.service");
    return OrderLifecycleService.cancelOrder(orderId, userId);
  }

  /**
   * Cancel order by admin (for emergency situations)
   * @param orderId Order ID
   * @param reason Optional cancellation reason
   * @returns Updated cancelled order
   * @throws BadRequestError if order already shipped/delivered
   * @desc Delegates to OrderLifecycleService.adminCancelOrder()
   * @access Private (Admin)
   */
  static async adminCancelOrder(orderId: string, reason?: string) {
    const { OrderLifecycleService } = await import("./order-lifecycle.service");
    return OrderLifecycleService.adminCancelOrder(orderId, reason);
  }

  /**
   * Ship order from store
   * @param orderId Order ID
   * @returns Updated order with SHIPPED status
   * @throws BadRequestError if order not in PROCESSING status
   * @desc Delegates to OrderLifecycleService.shipOrder()
   * @access Private (Store Admin)
   */
  static async shipOrder(orderId: string) {
    const { OrderLifecycleService } = await import("./order-lifecycle.service");
    return OrderLifecycleService.shipOrder(orderId);
  }

  /**
   * Confirm order delivery by customer
   * @param orderId Order ID
   * @param userId User ID (authorization)
   * @returns Updated order with DELIVERED status
   * @throws UnauthorizedError if user doesn't own order
   * @throws BadRequestError if order not in SHIPPED status
   * @desc Delegates to OrderLifecycleService.confirmOrder()
   */
  static async confirmOrder(orderId: string, userId: string) {
    const { OrderLifecycleService } = await import("./order-lifecycle.service");
    return OrderLifecycleService.confirmOrder(orderId, userId);
  }

  /**
   * Auto-confirm shipped orders after 2 days
   * @returns Array of auto-confirmed orders
   * @desc Delegates to OrderLifecycleService.autoConfirmOrders()
   * @note Admin scheduled task, triggered every 6 hours
   */
  static async autoConfirmOrders() {
    const { OrderLifecycleService } = await import("./order-lifecycle.service");
    return OrderLifecycleService.autoConfirmOrders();
  }

  /**
   * Create Midtrans payment charge for order
   * @param orderId Order ID
   * @returns Midtrans charge response (transaction token, payment URL)
   * @throws BadRequestError if order not found or invalid status
   * @desc Delegates to MidtransPaymentService.createMidtransCharge()
   */
  static async createMidtransCharge(orderId: string) {
    const { MidtransPaymentService } = await import("./midtrans-payment.service");
    return MidtransPaymentService.createMidtransCharge(orderId);
  }

  /**
   * Handle Midtrans webhook notification
   * @param webhookData Midtrans webhook payload
   * @returns Processing result
   * @note Handles: settlement, failure, cancellation, expiry, refund statuses
   * @desc Delegates to MidtransPaymentService.handleMidtransWebhook()
   * @security Signature verification handled by controller layer
   */
  static async handleMidtransWebhook(webhookData: any) {
    const { MidtransPaymentService } = await import("./midtrans-payment.service");
    return MidtransPaymentService.handleMidtransWebhook(webhookData);
  }
}
