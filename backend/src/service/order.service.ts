import { prisma } from "../lib/db/prisma";
import { CartRepository } from "../repository/cart.repository";
import { BadRequestError } from "../error/BadRequestError";
import { getDistance } from "geolib";
import { ShippingCostService } from "./shipping-cost.service";
import { GetShippingCostInput } from "../schema/shipping-cost/GetShippingCostSchema";
import type { PrismaClient, Prisma, Store } from "../../prisma/generated/client";
import { PricingCalculationService } from "./pricing-calculation.service";

type StoreWithDistance = {
  store: Store;
  distanceKm: number;
};

export class OrderService {
  private static isDiscountApplicable(
    discount: { startsAt: Date | null; endsAt: Date | null; isWithMinimum: boolean; minimumPrice: number | null; isLimited: boolean; limit: number | null; useCounter: number },
    subtotal: number
  ) {
    const now = new Date();
    const hasStarted = !discount.startsAt || discount.startsAt <= now;
    const hasNotEnded = !discount.endsAt || discount.endsAt >= now;
    const minimumPassed = !discount.isWithMinimum || discount.minimumPrice === null || subtotal >= discount.minimumPrice;
    const available = !discount.isLimited || (discount.limit !== null && discount.useCounter < discount.limit);
    return hasStarted && hasNotEnded && minimumPassed && available;
  }

  private static async incrementAppliedDiscountCounters(
    userId: string,
    subtotal: number,
    db: PrismaClient,
    discountIds?: string[],
    voucherIds?: string[]
  ) {
    const applicableDiscountIds = new Set<string>();

    if (discountIds && discountIds.length > 0) {
      const discounts = await db.discount.findMany({
        where: {
          id: { in: discountIds },
          isSoftDeleted: false,
        },
        select: {
          id: true,
          startsAt: true,
          endsAt: true,
          isWithMinimum: true,
          minimumPrice: true,
          isLimited: true,
          limit: true,
          useCounter: true,
        },
      });

      for (const discount of discounts) {
        if (this.isDiscountApplicable(discount, subtotal)) {
          applicableDiscountIds.add(discount.id);
        }
      }
    }

    if (voucherIds && voucherIds.length > 0) {
      const vouchers = await db.voucher.findMany({
        where: {
          isSoftDeleted: false,
          OR: [
            { id: { in: voucherIds } },
            { code: { in: voucherIds } },
          ],
          discount: {
            isSoftDeleted: false,
          },
        },
        include: {
          discount: {
            select: {
              id: true,
              startsAt: true,
              endsAt: true,
              isWithMinimum: true,
              minimumPrice: true,
              isLimited: true,
              limit: true,
              useCounter: true,
            },
          },
        },
      });

      for (const voucher of vouchers) {
        if (voucher.voucherType === "REFERRAL" && voucher.userId !== userId) {
          continue;
        }

        if (this.isDiscountApplicable(voucher.discount, subtotal)) {
          applicableDiscountIds.add(voucher.discount.id);
        }
      }
    }

    await Promise.all(
      Array.from(applicableDiscountIds).map((discountId) =>
        db.discount.updateMany({
          where: {
            id: discountId,
            isLimited: true,
            limit: { not: null },
            useCounter: {
              lt: db.discount.fields.limit,
            },
          },
          data: {
            useCounter: { increment: 1 },
          },
        })
      )
    );
  }

  /** Shared helper: find nearby stores sorted by distance */
  private static findNearbyStores(stores: Store[], lat: number, lon: number): StoreWithDistance[] {
    return stores
      .map((store) => {
        const sLat = Number(store.latitude);
        const sLon = Number(store.longitude);
        if (!Number.isFinite(sLat) || !Number.isFinite(sLon)) return null;
        const distanceKm = getDistance({ latitude: lat, longitude: lon }, { latitude: sLat, longitude: sLon }) / 1000;
        return { store, distanceKm } as StoreWithDistance;
      })
      .filter((s): s is StoreWithDistance => s !== null)
      .filter((s) => s.distanceKm <= 5)
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  /** Shared helper: find first store that can fulfill all items */
  private static async findFulfillableStore(db: PrismaClient, storesWithDistance: StoreWithDistance[], items: { productId: string; quantity: number }[]): Promise<StoreWithDistance | null> {
    const productIds = items.map((i) => i.productId);
    for (const s of storesWithDistance) {
      const storeProducts = await db.productStore.findMany({
        where: { storeId: s.store.id, productId: { in: productIds } },
      });
      const psMap: Record<string, { quantity: number }> = {};
      for (const ps of storeProducts) psMap[ps.productId] = ps as any;

      let canFulfill = true;
      for (const it of items) {
        const ps = psMap[it.productId];
        if (!ps || ps.quantity < it.quantity) {
          canFulfill = false;
          break;
        }
      }
      if (canFulfill) return s;
    }
    return null;
  }

  /**
   * Get checkout shipping info: find nearest store + return shipping methods
   * Called when user selects address on checkout page (Early Store Selection)
   */
  static async getCheckoutShippingInfo(userId: string, addressId: string) {
    const db: PrismaClient = prisma;

    const address = await db.userAddress.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== userId) throw new BadRequestError("SHIPPING_ADDRESS_REQUIRED");

    const cart = await CartRepository.findCartWithItemsAndProduct(userId);
    if (!cart || !cart.cartItems || cart.cartItems.length === 0) throw new BadRequestError("Cart is empty.");

    const items = cart.cartItems.map((ci) => ({ productId: ci.productId, quantity: ci.quantity }));
    const addrLat = Number(address.latitude);
    const addrLon = Number(address.longitude);

    const stores = await db.store.findMany();
    const storesWithDistance = this.findNearbyStores(stores, addrLat, addrLon);
    if (storesWithDistance.length === 0) throw new BadRequestError("No store within 5 km of the shipping address.");

    const candidate = await this.findFulfillableStore(db, storesWithDistance, items);
    if (!candidate) throw new BadRequestError("No store within 5 km can fulfill the entire order.");

    const { store } = candidate;

    // Calculate subtotal for shipping cost
    const productIds = items.map((i) => i.productId);
    const products = await db.product.findMany({ where: { id: { in: productIds } } });
    const productMap: Record<string, { price: number }> = {};
    for (const p of products) productMap[p.id] = p;
    const subtotal = items.reduce((s, it) => s + (productMap[it.productId]?.price ?? 0) * it.quantity, 0);

    // Fetch shipping methods from RajaOngkir
    const totalWeight = items.reduce((w, it) => w + it.quantity, 0);
    let shippingMethods = null;
    try {
      const scInput: GetShippingCostInput = {
        originPostCode: String(store.postCode ?? ""),
        destinationPostCode: String(address.postCode ?? ""),
        weight: totalWeight || 1,
        itemValue: subtotal,
      };
      shippingMethods = await ShippingCostService.getShippingCost(scInput);
    } catch (e) {
      console.warn(`[OrderService] Shipping cost fetch failed: ${e instanceof Error ? e.message : "unknown"}`);
      // Fallback: distance-based estimate
      const costPerKm = 1000;
      const fallbackCost = Math.ceil(candidate.distanceKm * costPerKm);
      shippingMethods = {
        calculate_reguler: [
          {
            shipping_name: "Estimasi",
            service_name: "Standard",
            weight: 1,
            is_cod: false,
            shipping_cost: fallbackCost,
            shipping_cashback: 0,
            shipping_cost_net: fallbackCost,
            grandtotal: fallbackCost,
            service_fee: 0,
            net_income: 0,
            etd: "3-5 hari",
          },
        ],
        calculate_cargo: [],
        calculate_instant: [],
      };
    }

    return {
      store: { id: store.id, name: store.name, postCode: store.postCode, addressName: store.addressName },
      distance: candidate.distanceKm,
      shippingMethods,
    };
  }

  /**
   * Create a pending order (checkout)
   * Now accepts shippingCost + shippingMethod from frontend (Early Store Selection)
   */
  static async createPendingOrder(
    userId: string,
    addressId: string,
    paymentType: "BANK_TRANSFER" | "PAYMENT_GATEWAY" = "BANK_TRANSFER",
    voucherIds?: string[],
    discountIds?: string[],
    selectedShippingCost?: number,
    _selectedShippingMethod?: string,
  ) {
    const db: PrismaClient = prisma;
    try {
      const address = await db.userAddress.findUnique({ where: { id: addressId } });
      if (!address || address.userId !== userId) throw new BadRequestError("SHIPPING_ADDRESS_REQUIRED");

      const cart = await CartRepository.findCartWithItemsAndProduct(userId);
      if (!cart || !cart.cartItems || cart.cartItems.length === 0) throw new BadRequestError("Cart is empty.");

      const items = cart.cartItems.map((ci) => ({ productId: ci.productId, quantity: ci.quantity }));

      // find nearby stores within 5km
      const addrLat = Number(address.latitude);
      const addrLon = Number(address.longitude);
      const stores = await db.store.findMany();
      const storesWithDistance = this.findNearbyStores(stores, addrLat, addrLon);

      if (storesWithDistance.length === 0) throw new BadRequestError("No store within 5 km of the shipping address.");

      // pick nearest store that can fulfill all items
      const candidate = await this.findFulfillableStore(db, storesWithDistance, items);
      if (!candidate) throw new BadRequestError("No store within 5 km can fulfill the entire order.");

      const candidateStore = candidate.store;
      const productIds = items.map((i) => i.productId);
      const products = await db.product.findMany({ where: { id: { in: productIds } }, include: { category: true } });
      type ProductWithCategory = Prisma.ProductGetPayload<{ include: { category: true } }>;
      const productMap: Record<string, ProductWithCategory | undefined> = {};
      for (const p of products as ProductWithCategory[]) productMap[p.id] = p;

      const subtotal = items.reduce((s, it) => s + (productMap[it.productId]?.price ?? 0) * it.quantity, 0);

      // Use frontend-provided shipping cost (Early Selection) or fallback to auto-calculate
      let shippingCost: number;
      if (selectedShippingCost !== undefined && selectedShippingCost >= 0) {
        shippingCost = selectedShippingCost;
      } else {
        const distanceKm = candidate.distanceKm;
        const costPerKm = 1000;
        try {
          const scInput: GetShippingCostInput = {
            originPostCode: String(candidateStore.postCode ?? ""),
            destinationPostCode: String(address.postCode ?? ""),
            weight: 1,
            itemValue: subtotal,
          };
          const scData = await ShippingCostService.getShippingCost(scInput);
          const option = scData.calculate_reguler?.[0] ?? scData.calculate_instant?.[0] ?? scData.calculate_cargo?.[0];
          shippingCost = option?.shipping_cost_net ?? Math.ceil(distanceKm * costPerKm);
        } catch (e) {
          console.warn(`[OrderService] Shipping cost fallback: ${e instanceof Error ? e.message : "unknown error"}`);
          shippingCost = Math.ceil(distanceKm * costPerKm);
        }
      }

      const totalDiscount = await PricingCalculationService.calculateTotalDiscount(subtotal, discountIds, voucherIds, db, userId);
      const grandTotal = subtotal + shippingCost - totalDiscount;

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
    } catch (err: any) {
      console.error("[OrderService] createPendingOrder error:", err instanceof Error ? err.stack || err.message : err);
      throw err;
    }
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
