import { prisma } from "../../lib/db/prisma";
import { CartRepository } from "../../repository/cart.repository";
import { BadRequestError } from "../../error/BadRequestError";
import { ShippingCostService } from "../shipping-cost.service";
import type { GetShippingCostInput } from "../../schema/shipping-cost/GetShippingCostSchema";
import type { PrismaClient, Prisma } from "../../../prisma/generated/client";
import { PricingCalculationService } from "../pricing-calculation.service";
import { StoreOrderCapacityService } from "../store-order-capacity.service";
import type { VoucherResponse } from "../../repository/voucher/entity";
import { CheckoutFingerprintService } from "./order-checkout-fingerprint.service";
import { OrderStoreSelectionService } from "./order-store-selection.service";
import { OrderVoucherReservationService } from "./order-voucher-reservation.service";
import { OrderDiscountCounterService } from "./order-discount-counter.service";
import type { CheckoutItem } from "./order.types";

type ProductWithCategory = Prisma.ProductGetPayload<{ include: { category: true } }>;

export class OrderCheckoutService {
  private static buildProductMap(products: ProductWithCategory[]): Record<string, ProductWithCategory | undefined> {
    const productMap: Record<string, ProductWithCategory | undefined> = {};
    for (const product of products) {
      productMap[product.id] = product;
    }
    return productMap;
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

    const items: CheckoutItem[] = cart.cartItems.map((cartItem) => ({ productId: cartItem.productId, quantity: cartItem.quantity }));
    const addrLat = Number(address.latitude);
    const addrLon = Number(address.longitude);

    const stores = await db.store.findMany();
    const storesWithDistance = OrderStoreSelectionService.findNearbyStores(stores, addrLat, addrLon);
    if (storesWithDistance.length === 0) throw new BadRequestError("No store within 5 km of the shipping address.");

    const maxActiveOrdersPerStore = StoreOrderCapacityService.getMaxActiveOrdersPerStore();
    const activeOrderCountByStoreId = await StoreOrderCapacityService.getActiveOrderCountByStoreIds(
      db,
      storesWithDistance.map((storeWithDistance) => storeWithDistance.store.id),
    );

    const candidate = await OrderStoreSelectionService.findFulfillableStore(
      db,
      storesWithDistance,
      items,
      activeOrderCountByStoreId,
      maxActiveOrdersPerStore,
    );
    if (!candidate) throw new BadRequestError("No store within 5 km can fulfill the entire order or store capacity is full.");

    const { store } = candidate;

    // Calculate subtotal for shipping cost
    const productIds = items.map((item) => item.productId);
    const products = await db.product.findMany({ where: { id: { in: productIds } } });
    const productMap: Record<string, { price: number }> = {};
    for (const product of products) {
      productMap[product.id] = product;
    }
    const subtotal = items.reduce(
      (sum, item) => sum + (productMap[item.productId]?.price ?? 0) * item.quantity,
      0,
    );

    // Fetch shipping methods from RajaOngkir
    const totalWeight = items.reduce((weight, item) => weight + item.quantity, 0);
    let shippingMethods = null;
    try {
      const shippingCostInput: GetShippingCostInput = {
        originPostCode: String(store.postCode ?? ""),
        destinationPostCode: String(address.postCode ?? ""),
        weight: totalWeight || 1,
        itemValue: subtotal,
      };
      shippingMethods = await ShippingCostService.getShippingCost(shippingCostInput);
    } catch (error) {
      console.warn(`[OrderService] Shipping cost fetch failed: ${error instanceof Error ? error.message : "unknown"}`);
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
      store: {
        id: store.id,
        name: store.name,
        postCode: store.postCode,
        addressName: store.addressName,
      },
      distance: candidate.distanceKm,
      shippingMethods,
    };
  }

  /**
   * Get checkout pricing breakdown with per-item discount details
   * Called on checkout page to display itemized discounts
   */
  static async getCheckoutPricingBreakdown(
    userId: string,
    addressId: string,
    voucherIds?: string[],
    discountIds?: string[],
    shippingCost: number = 0,
  ) {
    const db: PrismaClient = prisma;

    const address = await db.userAddress.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== userId) throw new BadRequestError("SHIPPING_ADDRESS_REQUIRED");

    const cart = await CartRepository.findCartWithItemsAndProduct(userId);
    if (!cart || !cart.cartItems || cart.cartItems.length === 0) throw new BadRequestError("Cart is empty.");

    const items: CheckoutItem[] = cart.cartItems.map((cartItem) => ({
      productId: cartItem.productId,
      quantity: cartItem.quantity,
    }));

    const products = (await db.product.findMany({
      where: { id: { in: items.map((item) => item.productId) } },
      include: { category: true },
    })) as ProductWithCategory[];

    const productMap = this.buildProductMap(products);

    const subtotal = items.reduce(
      (sum, item) => sum + (productMap[item.productId]?.price ?? 0) * item.quantity,
      0,
    );

    // Get auto-applied global discounts
    const autoGlobalDiscountIds =
      await PricingCalculationService.getAutoAppliedGlobalDiscountIds(subtotal, db);

    const combinedDiscountIds = Array.from(
      new Set([...(discountIds ?? []), ...autoGlobalDiscountIds]),
    );

    const combinedDiscounts = await db.discount.findMany({
      where: {
        id: { in: combinedDiscountIds },
        isSoftDeleted: false,
      },
    });

    // Product/global promotion breakdown (excluding vouchers)
    const promotionBreakdown = await PricingCalculationService.calculateProductPromotionBreakdown(
      items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: productMap[item.productId]?.price ?? 0,
      })),
      db,
      combinedDiscounts.length > 0 ? combinedDiscounts : undefined,
    );

    const promotionDiscount = promotionBreakdown.totalDiscount;
    let voucherProductDiscount = 0;
    let voucherShippingDiscount = 0;
    let voucherQuantityBonuses: Array<{
      productId: string;
      freeQuantity: number;
    }> = [];
    let appliedVouchers: Array<{
      code: string;
      type: "PRODUCT" | "QUANTITY" | "SHIPPING";
      savedAmount: number;
    }> = [];

    const normalizedShippingCost = Math.max(0, Number(shippingCost) || 0);
    const normalizedVoucherIdentifiers = (voucherIds ?? [])
      .map((identifier) => identifier.trim())
      .filter((identifier) => identifier.length > 0);

    if (normalizedVoucherIdentifiers.length > 0) {
      const { VoucherService } = await import("../voucher/voucher.service");
      const { PrismaVoucherRepository } = await import(
        "../../repository/voucher/adapter_prisma"
      );

      const voucherService = new VoucherService(new PrismaVoucherRepository(db));
      const subtotalAfterPromotion = subtotal - promotionDiscount;
      const voucherBreakdown = await voucherService.calculateVoucherDiscountBreakdown(
        normalizedVoucherIdentifiers,
        subtotalAfterPromotion,
        userId,
        normalizedShippingCost,
        items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: productMap[item.productId]?.price ?? 0,
        })),
      );

      voucherProductDiscount = voucherBreakdown.productDiscount;
      voucherShippingDiscount = voucherBreakdown.shippingDiscount;
      voucherQuantityBonuses = voucherBreakdown.quantityBonuses;
      appliedVouchers = voucherBreakdown.appliedVouchers;
    }

    const voucherBonusMap = new Map<string, number>();
    for (const line of voucherQuantityBonuses) {
      voucherBonusMap.set(
        line.productId,
        (voucherBonusMap.get(line.productId) ?? 0) + line.freeQuantity,
      );
    }

    // Build itemized breakdown with product details
    const itemizedBreakdown = promotionBreakdown.lines.map((line) => {
      const product = productMap[line.productId];
      const cartItem = items.find((item) => item.productId === line.productId);

      return {
        productId: line.productId,
        productName: product?.name || "Unknown Product",
        quantity: cartItem?.quantity || 0,
        unitPrice: product?.price || 0,
        totalPrice: (product?.price || 0) * (cartItem?.quantity || 0),
        totalDiscount: line.totalDiscount,
        bogoFreeQuantity:
          line.bogoFreeQuantity + (voucherBonusMap.get(line.productId) ?? 0),
        appliedDiscounts: [...line.itemDiscounts],
      };
    });

    const productDiscount = promotionDiscount + voucherProductDiscount;
    const finalShippingCost = Math.max(0, normalizedShippingCost - voucherShippingDiscount);
    const totalDiscount = productDiscount + voucherShippingDiscount;
    const grandTotal = subtotal - productDiscount + finalShippingCost;
    const appliedVoucherDiscounts = appliedVouchers.filter(
      (voucher) => voucher.type === "PRODUCT",
    );

    return {
      subtotal,
      defaultProductDiscount: promotionDiscount,
      voucherDiscount: voucherProductDiscount,
      totalDiscountExcludingShipping: productDiscount,
      productDiscount,
      shippingDiscount: voucherShippingDiscount,
      shippingCost: normalizedShippingCost,
      finalShippingCost,
      totalDiscount,
      grandTotal,
      items: itemizedBreakdown,
      appliedVouchers,
      appliedVoucherDiscounts,
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
      if (!address || address.userId !== userId) {
        throw new BadRequestError("SHIPPING_ADDRESS_REQUIRED");
      }

      const cart = await CartRepository.findCartWithItemsAndProduct(userId);
      if (!cart || !cart.cartItems || cart.cartItems.length === 0) {
        throw new BadRequestError("Cart is empty.");
      }

      const items: CheckoutItem[] = cart.cartItems.map((cartItem) => ({
        productId: cartItem.productId,
        quantity: cartItem.quantity,
      }));

      const normalizedVoucherIdentifiers = CheckoutFingerprintService.normalizeVoucherIdentifiers(
        voucherIds,
      );

      const reusablePendingOrder = await CheckoutFingerprintService.findReusablePendingOrder(
        db,
        userId,
        addressId,
        items,
        normalizedVoucherIdentifiers,
      );

      if (reusablePendingOrder) {
        await db.cartItem.deleteMany({
          where: {
            cartId: cart.id,
            productId: { in: items.map((item) => item.productId) },
          },
        });
        return reusablePendingOrder;
      }

      // find nearby stores within 5km
      const addrLat = Number(address.latitude);
      const addrLon = Number(address.longitude);
      const stores = await db.store.findMany();
      const storesWithDistance = OrderStoreSelectionService.findNearbyStores(
        stores,
        addrLat,
        addrLon,
      );

      if (storesWithDistance.length === 0) {
        throw new BadRequestError("No store within 5 km of the shipping address.");
      }

      const maxActiveOrdersPerStore =
        StoreOrderCapacityService.getMaxActiveOrdersPerStore();
      const activeOrderCountByStoreId =
        await StoreOrderCapacityService.getActiveOrderCountByStoreIds(
          db,
          storesWithDistance.map((storeWithDistance) => storeWithDistance.store.id),
        );

      // pick nearest store that can fulfill all items
      const candidate = await OrderStoreSelectionService.findFulfillableStore(
        db,
        storesWithDistance,
        items,
        activeOrderCountByStoreId,
        maxActiveOrdersPerStore,
      );

      if (!candidate) {
        throw new BadRequestError(
          "No store within 5 km can fulfill the entire order or store capacity is full.",
        );
      }

      const candidateStore = candidate.store;
      const productIds = items.map((item) => item.productId);
      const products = (await db.product.findMany({
        where: { id: { in: productIds } },
        include: { category: true },
      })) as ProductWithCategory[];

      const productMap = this.buildProductMap(products);

      const subtotal = items.reduce(
        (sum, item) => sum + (productMap[item.productId]?.price ?? 0) * item.quantity,
        0,
      );

      // Use frontend-provided shipping cost (Early Selection) or fallback to auto-calculate
      let shippingCost: number;
      if (selectedShippingCost !== undefined && selectedShippingCost >= 0) {
        shippingCost = selectedShippingCost;
      } else {
        const distanceKm = candidate.distanceKm;
        const costPerKm = 1000;
        try {
          const shippingCostInput: GetShippingCostInput = {
            originPostCode: String(candidateStore.postCode ?? ""),
            destinationPostCode: String(address.postCode ?? ""),
            weight: 1,
            itemValue: subtotal,
          };
          const shippingCostData = await ShippingCostService.getShippingCost(shippingCostInput);
          const option =
            shippingCostData.calculate_reguler?.[0] ??
            shippingCostData.calculate_instant?.[0] ??
            shippingCostData.calculate_cargo?.[0];
          shippingCost = option?.shipping_cost_net ?? Math.ceil(distanceKm * costPerKm);
        } catch (error) {
          console.warn(
            `[OrderService] Shipping cost fallback: ${error instanceof Error ? error.message : "unknown error"}`,
          );
          shippingCost = Math.ceil(distanceKm * costPerKm);
        }
      }

      const autoGlobalDiscountIds =
        await PricingCalculationService.getAutoAppliedGlobalDiscountIds(subtotal, db);
      const combinedDiscountIds = Array.from(
        new Set([...(discountIds ?? []), ...autoGlobalDiscountIds]),
      );

      const combinedDiscounts = await db.discount.findMany({
        where: {
          id: { in: combinedDiscountIds },
          isSoftDeleted: false,
        },
      });

      // Use unified function to calculate all discounts (item-level + global)
      const promotionBreakdown =
        await PricingCalculationService.calculateProductPromotionBreakdown(
          items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: productMap[item.productId]?.price ?? 0,
          })),
          db,
          combinedDiscounts.length > 0 ? combinedDiscounts : undefined,
        );

      // Product/global promotion discount from breakdown
      const promotionDiscount = promotionBreakdown.totalDiscount;
      const promotionQuantityBonuses = promotionBreakdown.lines
        .map((line) => ({
          productId: line.productId,
          freeQuantity: Math.max(0, Number(line.bogoFreeQuantity) || 0),
        }))
        .filter((line) => line.freeQuantity > 0);

      // Voucher discount calculation (applied after product promotions)
      let voucherProductDiscount = 0;
      let voucherShippingDiscount = 0;
      let voucherQuantityBonuses: Array<{
        productId: string;
        freeQuantity: number;
      }> = [];
      let appliedVoucherDiscounts: Array<{
        code: string;
        savedAmount: number;
      }> = [];

      const cartItemsForDiscount = items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: productMap[item.productId]?.price ?? 0,
      }));

      if (normalizedVoucherIdentifiers.length > 0) {
        const { VoucherService } = await import("../voucher/voucher.service");
        const { PrismaVoucherRepository } = await import(
          "../../repository/voucher/adapter_prisma"
        );

        const voucherService = new VoucherService(new PrismaVoucherRepository(db));
        const subtotalAfterProductPromotion = subtotal - promotionDiscount;

        const breakdown = await voucherService.calculateVoucherDiscountBreakdown(
          normalizedVoucherIdentifiers,
          subtotalAfterProductPromotion,
          userId,
          shippingCost,
          cartItemsForDiscount.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        );

        voucherProductDiscount = breakdown.productDiscount;
        voucherShippingDiscount = breakdown.shippingDiscount;
        voucherQuantityBonuses = breakdown.quantityBonuses;
        appliedVoucherDiscounts = (breakdown.appliedVouchers ?? [])
          .filter((voucher) => voucher.type === "PRODUCT")
          .map((voucher) => ({
            code: voucher.code,
            savedAmount: voucher.savedAmount,
          }));

        const [vouchersByIds, vouchersByCodes] = await Promise.all([
          voucherService.getVouchersByIds(normalizedVoucherIdentifiers),
          voucherService.getVouchersByCodes(normalizedVoucherIdentifiers),
        ]);

        const voucherMap = new Map<string, VoucherResponse>();
        [...vouchersByIds, ...vouchersByCodes].forEach((voucher) => {
          voucherMap.set(voucher.id, voucher);
        });

        await OrderVoucherReservationService.enforceVoucherReservationConstraints(
          db,
          Array.from(voucherMap.values()).map((voucher) => ({
            id: voucher.id,
            code: voucher.code,
            userId: voucher.userId,
            voucherType: voucher.voucherType,
            discount: {
              isQuantityLimited: voucher.discount.isQuantityLimited,
              maxUses: voucher.discount.maxUses,
              useCounter: voucher.discount.useCounter,
            },
          })),
        );
      }

      const totalDiscount =
        promotionDiscount + voucherProductDiscount + voucherShippingDiscount;
      const grandTotal = subtotal + shippingCost - totalDiscount;

      // Collect limited non-voucher discount IDs for counter tracking
      const limitedNonVoucherDiscountIds =
        combinedDiscountIds.length > 0
          ? (
              await db.discount.findMany({
                where: {
                  id: { in: combinedDiscountIds },
                  isSoftDeleted: false,
                  isVoucher: false,
                  isQuantityLimited: true,
                  maxUses: { not: null },
                },
                select: { id: true },
              })
            ).map((discount) => discount.id)
          : [];

      const discountNames: string[] = [];
      if (promotionDiscount > 0) {
        discountNames.push(`PRODUCT_PROMO_DISCOUNT:${promotionDiscount}`);
      }
      if (voucherProductDiscount > 0) {
        discountNames.push(`VOUCHER_PRODUCT_DISCOUNT:${voucherProductDiscount}`);
      }
      if (voucherShippingDiscount > 0) {
        discountNames.push(`SHIPPING_DISCOUNT:${voucherShippingDiscount}`);
      }

      const promotionQuantityBonusesToken =
        OrderVoucherReservationService.serializeQuantityBonuses(
          "PROMO_QTY_BONUSES",
          promotionQuantityBonuses,
        );
      if (promotionQuantityBonusesToken) {
        discountNames.push(promotionQuantityBonusesToken);
      }

      const voucherQuantityBonusesToken =
        OrderVoucherReservationService.serializeVoucherQuantityBonuses(
          voucherQuantityBonuses,
        );
      if (voucherQuantityBonusesToken) {
        discountNames.push(voucherQuantityBonusesToken);
      }

      const voucherAppliedAmountsToken =
        OrderVoucherReservationService.serializeVoucherAppliedAmounts(
          appliedVoucherDiscounts,
        );
      if (voucherAppliedAmountsToken) {
        discountNames.push(voucherAppliedAmountsToken);
      }

      if (limitedNonVoucherDiscountIds.length > 0) {
        discountNames.push(
          `NON_VOUCHER_LIMITED_IDS:${limitedNonVoucherDiscountIds.join(",")}`,
        );
      }

      const paymentDueHours = Number.isFinite(Number(process.env.PAYMENT_DUE_HOURS))
        ? Number(process.env.PAYMENT_DUE_HOURS)
        : 1;
      const paymentDueAt = new Date(Date.now() + paymentDueHours * 60 * 60 * 1000);

      const order = await db.$transaction(async (tx) => {
        const createdOrder = await tx.order.create({
          data: {
            subtotal,
            totalDiscount,
            shippingCost,
            grandTotal,
            status: "PAYMENT_PENDING",
            paymentType,
            voucherCodes: normalizedVoucherIdentifiers,
            appliedDiscountIds: combinedDiscountIds,
            discountNames,
            shippingAddress: `${address.recipientName} - ${address.addressName} | ${address.latitude},${address.longitude} | ${address.postCode}`,
            storeAddress: candidateStore.addressName,
            storeName: candidateStore.name,
            storeId: candidateStore.id,
            userAddressId: addressId,
            paymentDueAt,
            userId,
            orderItems: {
              create: items.map((item) => ({
                quantity: item.quantity,
                unitPrice: productMap[item.productId]?.price ?? 0,
                productName: productMap[item.productId]?.name ?? "",
                productCategory:
                  productMap[item.productId]?.category?.name ?? "",
                productId: item.productId,
              })),
            },
          },
        });

        // Remove checked-out items from cart immediately after order is placed.
        await tx.cartItem.deleteMany({
          where: {
            cartId: cart.id,
            productId: { in: items.map((item) => item.productId) },
          },
        });

        return createdOrder;
      });

      // Increment discount usage counters for the successfully created order
      await OrderDiscountCounterService.incrementAppliedDiscountCounters(
        userId,
        subtotal,
        db,
        combinedDiscountIds.length > 0 ? combinedDiscountIds : undefined,
        normalizedVoucherIdentifiers.length > 0
          ? normalizedVoucherIdentifiers
          : undefined,
      );

      return order;
    } catch (error: any) {
      console.error(
        "[OrderService] createPendingOrder error:",
        error instanceof Error ? error.stack || error.message : error,
      );
      throw error;
    }
  }
}
