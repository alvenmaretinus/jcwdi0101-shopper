import { PrismaClient } from "../../prisma/generated/client";
import { PrismaRepository as DiscountRepository } from "../repository/discount/adapter_prisma";
import { DiscountResponse } from "../repository/discount/entity";
import { calculateStackedDiscount } from "../lib/discount/calculateStackedDiscount";

export type ProductLineItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type CalculatedDiscount = {
  id: string;
  name: string;
  label: string;
  savedAmount: number;
  endsAt?: Date | null;
};

export type ProductPromotionLineBreakdown = {
  productId: string;
  totalDiscount: number;
  bogoFreeQuantity: number;
  itemDiscounts: CalculatedDiscount[]; // Item-specific discounts applied to this line
};

export type ProductPromotionBreakdown = {
  totalDiscount: number;
  lines: ProductPromotionLineBreakdown[];
};

export class PricingCalculationService {
  private static calculateBestBogoFreeQuantity(
    quantity: number,
    quantityDiscounts?: Array<{
      buyQuantity: number;
      freeQuantity: number;
    }>,
  ): number {
    if (!quantityDiscounts || quantityDiscounts.length === 0 || quantity <= 0) {
      return 0;
    }

    let bestFreeQuantity = 0;
    for (const quantityDiscount of quantityDiscounts) {
      if (quantityDiscount.buyQuantity <= 0 || quantityDiscount.freeQuantity <= 0) {
        continue;
      }

      const freeUnits = Math.floor(quantity / quantityDiscount.buyQuantity) * quantityDiscount.freeQuantity;
      if (freeUnits > bestFreeQuantity) {
        bestFreeQuantity = freeUnits;
      }
    }

    return bestFreeQuantity;
  }

  /**
   * Calculate item-level promotions with optional global discounts.
   * This is the consolidated function for all discount calculations during checkout and order creation.
   *
   * @param items Array of cart items with product ID, quantity, and unit price
   * @param db PrismaClient instance
   * @param globalDiscountIds Optional array of global discount IDs to apply
   * @returns Detailed breakdown: per-item discounts, global discounts, and applied discount details
   *
   * Usage:
   *  - Checkout: Call with globalDiscountIds to get per-item discount breakdown for display
   *  - Order creation: Call with globalDiscountIds to calculate final prices
   *  - Product page: Call without globalDiscountIds to show item-only savings
   */
  static async calculateProductPromotionBreakdown(items: ProductLineItem[], db: PrismaClient, globalDiscounts?: DiscountResponse[]): Promise<ProductPromotionBreakdown> {
    if (!items || items.length === 0) {
      return {
        totalDiscount: 0,

        lines: [],
      };
    }

    const productIds = Array.from(new Set(items.map((item) => item.productId)));
    if (productIds.length === 0) {
      return {
        totalDiscount: 0,

        lines: [],
      };
    }

    const now = new Date();
    const discounts = (await db.discount.findMany({
      where: {
        isSoftDeleted: false,
        isVoucher: false,
        isTiedToProduct: true,
        productId: { in: productIds },
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      select: {
        id: true,
        name: true,
        percentage: true,
        amount: true,
        type: true,
        isVoucher: true,
        isWithMinimum: true,
        minimumPrice: true,
        hasDiscountAmountCap: true,
        maxDiscountAmount: true,
        isQuantityLimited: true,
        maxUses: true,
        useCounter: true,
        isTiedToProduct: true,
        productId: true,
        buyQuantity: true,
        freeQuantity: true,
        startsAt: true,
        endsAt: true,
        isSoftDeleted: true,
        createdAt: true,
        updatedAt: true,
      },
    })) as DiscountResponse[];

    discounts.push(...(globalDiscounts ?? []));

    const discountsByProduct = new Map<string, DiscountResponse[]>();
    discounts.forEach((discount) => {
      if (!discount.productId) {
        for (const productId of productIds) {
          const current = discountsByProduct.get(productId) ?? [];
          current.push(discount);
          discountsByProduct.set(productId, current);
        }
        return;
      }
      const current = discountsByProduct.get(discount.productId) ?? [];
      current.push(discount);
      discountsByProduct.set(discount.productId, current);
    });

    let itemLevelDiscount = 0;
    const lines: ProductPromotionLineBreakdown[] = [];

    for (const item of items) {
      if (item.quantity <= 0 || item.unitPrice <= 0) {
        lines.push({
          productId: item.productId,
          totalDiscount: 0,
          bogoFreeQuantity: 0,
          itemDiscounts: [],
        });
        continue;
      }

      const lineSubtotal = item.unitPrice * item.quantity;
      const availableDiscounts = (discountsByProduct.get(item.productId) ?? []).filter((discount) => {
        const available = !discount.isQuantityLimited || (discount.maxUses !== null && discount.useCounter < discount.maxUses);
        const minimumPassed = !discount.isWithMinimum || discount.minimumPrice === null || lineSubtotal >= discount.minimumPrice;
        return available && minimumPassed;
      });

      if (availableDiscounts.length === 0) {
        lines.push({
          productId: item.productId,
          totalDiscount: 0,
          bogoFreeQuantity: 0,
          itemDiscounts: [],
        });
        continue;
      }

      // Calculate price discount at line level so minimum purchase and
      // capped percentage discounts are evaluated against total line value.
      // Fixed amount discounts are scaled by quantity to keep per-unit semantics.
      const discountsForLinePricing = availableDiscounts.map((discount) => {
        if (discount.type === "FIXED_AMOUNT" && discount.amount !== null) {
          return {
            ...discount,
            amount: discount.amount * item.quantity,
          };
        }
        return discount;
      });

      const stacked = calculateStackedDiscount(lineSubtotal, discountsForLinePricing);
      const priceDiscountTotal = Math.min(stacked.totalDiscount, lineSubtotal);

      const bogoFreeQuantity = this.calculateBestBogoFreeQuantity(item.quantity, stacked.quantityDiscounts);
      itemLevelDiscount += priceDiscountTotal;

      lines.push({
        productId: item.productId,
        totalDiscount: Math.round(priceDiscountTotal),
        bogoFreeQuantity,
        itemDiscounts: stacked.appliedDiscounts,
      });
    }

    return {
      totalDiscount: Math.round(itemLevelDiscount),
      lines,
    };
  }

  /**
   * Resolve active non-voucher global discounts that should be auto-applied
   * during cart/checkout pricing.
   */
  static async getAutoAppliedGlobalDiscountIds(subtotal: number, db: PrismaClient): Promise<string[]> {
    const now = new Date();
    const discounts = await db.discount.findMany({
      where: {
        isSoftDeleted: false,
        isVoucher: false,
        isTiedToProduct: false,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      select: {
        id: true,
        isWithMinimum: true,
        minimumPrice: true,
        isQuantityLimited: true,
        maxUses: true,
        useCounter: true,
        hasDiscountAmountCap: true,
        maxDiscountAmount: true,
      },
    });

    return discounts
      .filter((discount) => {
        const minimumPassed = !discount.isWithMinimum || discount.minimumPrice === null || subtotal >= discount.minimumPrice;
        const available = !discount.isQuantityLimited || (discount.maxUses !== null && discount.useCounter < discount.maxUses);
        const limitedDiscountAvailable = !discount.hasDiscountAmountCap || discount.maxDiscountAmount !== null;

        return minimumPassed && available && limitedDiscountAvailable;
      })
      .map((discount) => discount.id);
  }

  /**
   * Calculate total discount from discount IDs and voucher IDs
   * @param subtotal The base price before any discounts (can be ignored if cartItems provided)
   * @param discountIds Array of discount IDs to apply
   * @param voucherIds Array of voucher IDs to apply (applied after discounts)
   * @param db PrismaClient instance
   * @param userId User ID for voucher validation
   * @param shippingCost Shipping cost used for FREEDELIVERY voucher calculation
   * @param cartItems Optional cart items for product-specific discount calculation
   * @returns Total discount amount
   */
  static async calculateTotalDiscount(
    subtotal: number,
    discountIds: string[] | undefined,
    voucherIds: string[] | undefined,
    db: PrismaClient,
    userId?: string,
    shippingCost: number = 0,
    cartItems?: Array<{ productId: string; quantity: number; price: number }>,
  ): Promise<number> {
    let totalDiscount = 0;

    // Calculate discount using percentage, amount, and quantity discounts (applied before vouchers)
    if (discountIds && discountIds.length > 0) {
      const discountAmount = await this.calculateDiscounts(subtotal, discountIds, db, cartItems);
      totalDiscount += discountAmount;
    }

    // Calculate voucher discount using VoucherService (ranked by highest amount first)
    // Vouchers are applied after discounts
    if (voucherIds && voucherIds.length > 0) {
      const priceAfterDiscounts = subtotal - totalDiscount;
      const voucherAmount = await this.calculateVouchers(priceAfterDiscounts, voucherIds, db, userId, shippingCost, cartItems);
      totalDiscount += voucherAmount;
    }

    return totalDiscount;
  }

  /**
   * Calculate discount amount from discount IDs
   * @param subtotal The base price before discounts
   * @param discountIds Array of discount IDs to apply
   * @param db PrismaClient instance
   * @param cartItems Optional cart items for product-specific and quantity discount calculation
   * @returns Total discount amount from percentage, fixed amount, and quantity discounts
   * @note Uses optimal selection: compares best percentage vs best amount discount iteratively
   */
  private static async calculateDiscounts(subtotal: number, discountIds: string[], db: PrismaClient, cartItems?: Array<{ productId: string; quantity: number; price: number }>): Promise<number> {
    const discountRepo = new DiscountRepository(db);

    // Fetch all discounts by IDs and filter for active ones
    const allDiscounts = await Promise.all(discountIds.map((id) => discountRepo.getDiscountById(id)));

    // Filter valid discounts: non-null, not vouchers, not soft-deleted, and currently active
    const now = new Date();
    const discounts = allDiscounts
      .filter((d): d is DiscountResponse => d !== null && !d.isVoucher && !d.isSoftDeleted)
      .filter((d) => {
        const hasStarted = !d.startsAt || d.startsAt <= now;
        const hasNotEnded = !d.endsAt || d.endsAt >= now;
        const minimumMet = !d.isWithMinimum || (d.minimumPrice !== null && subtotal >= d.minimumPrice);
        const available = !d.isQuantityLimited || (d.maxUses !== null && d.useCounter < d.maxUses);
        return hasStarted && hasNotEnded && minimumMet && available;
      });

    // Separate discounts by type
    const productSpecificDiscounts = discounts.filter((d) => d.isTiedToProduct && d.productId);
    const quantityDiscounts = discounts.filter((d) => d.type === "QUANTITY" && d.buyQuantity && d.freeQuantity && d.productId);

    // Helper: apply 3-array algorithm to a set of discounts against a remaining price
    const applyThreeBucketAlgorithm = (applicableDiscounts: DiscountResponse[], startingPrice: number): number => {
      // Bucket 1: Pure percentage (no limit)
      const purePctDiscounts = applicableDiscounts.filter((d) => d.type === "PERCENTAGE" && !d.hasDiscountAmountCap).sort((a, b) => Number(b.percentage ?? 0) - Number(a.percentage ?? 0));

      // Bucket 2: Fixed amount
      const fixedAmtDiscounts = applicableDiscounts.filter((d) => d.type === "FIXED_AMOUNT").sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));

      // Bucket 3: Percentage with limit (effective amount recalculated each iteration)
      const limitedPctDiscounts = applicableDiscounts.filter((d) => d.type === "PERCENTAGE" && d.hasDiscountAmountCap && d.maxDiscountAmount);

      let discountTotal = 0;
      let remaining = startingPrice;

      while (remaining > 0) {
        let bestPurePctAmt = 0;
        if (purePctDiscounts.length > 0) {
          bestPurePctAmt = remaining * (Number(purePctDiscounts[0].percentage ?? 0) / 100);
        }

        let bestFixedAmt = 0;
        if (fixedAmtDiscounts.length > 0) {
          bestFixedAmt = Number(fixedAmtDiscounts[0].amount ?? 0);
        }

        let bestLimitedAmt = 0;
        let bestLimitedIdx = -1;
        for (let i = 0; i < limitedPctDiscounts.length; i++) {
          const d = limitedPctDiscounts[i];
          const rawPct = remaining * (Number(d.percentage ?? 0) / 100);
          const effective = Math.min(rawPct, d.maxDiscountAmount!);
          if (effective > bestLimitedAmt) {
            bestLimitedAmt = effective;
            bestLimitedIdx = i;
          }
        }

        if (bestPurePctAmt <= 0 && bestFixedAmt <= 0 && bestLimitedAmt <= 0) break;

        if (bestPurePctAmt >= bestFixedAmt && bestPurePctAmt >= bestLimitedAmt) {
          const actual = Math.min(bestPurePctAmt, remaining);
          if (actual > 0) {
            discountTotal += actual;
            remaining -= actual;
          }
          purePctDiscounts.shift();
        } else if (bestFixedAmt >= bestPurePctAmt && bestFixedAmt >= bestLimitedAmt) {
          const actual = Math.min(bestFixedAmt, remaining);
          if (actual > 0) {
            discountTotal += actual;
            remaining -= actual;
          }
          fixedAmtDiscounts.shift();
        } else {
          const actual = Math.min(bestLimitedAmt, remaining);
          if (actual > 0) {
            discountTotal += actual;
            remaining -= actual;
          }
          limitedPctDiscounts.splice(bestLimitedIdx, 1);
        }
      }

      return discountTotal;
    };

    let totalDiscount = 0;

    // Step 1: Apply product-specific discounts (percentage/amount) to individual items
    if (cartItems && cartItems.length > 0 && productSpecificDiscounts.length > 0) {
      const productDiscountMap = new Map<string, DiscountResponse[]>();
      for (const discount of productSpecificDiscounts) {
        if (discount.productId) {
          if (!productDiscountMap.has(discount.productId)) {
            productDiscountMap.set(discount.productId, []);
          }
          productDiscountMap.get(discount.productId)!.push(discount);
        }
      }

      for (const item of cartItems) {
        const itemDiscounts = productDiscountMap.get(item.productId) || [];
        if (itemDiscounts.length === 0) continue;

        const itemTotal = item.price * item.quantity;
        const priceItemDiscounts = itemDiscounts.filter((d) => d.type === "PERCENTAGE" || d.type === "FIXED_AMOUNT");
        totalDiscount += applyThreeBucketAlgorithm(priceItemDiscounts, itemTotal);
      }
    }

    // Step 2: Handle QUANTITY discounts (buy X get Y free) - these reduce effective price
    if (cartItems && cartItems.length > 0 && quantityDiscounts.length > 0) {
      for (const discount of quantityDiscounts) {
        const item = cartItems.find((ci) => ci.productId === discount.productId);
        if (!item || !discount.buyQuantity || !discount.freeQuantity) continue;

        const setsEligible = Math.floor(item.quantity / discount.buyQuantity);
        const freeItems = setsEligible * discount.freeQuantity;
        const quantityDiscountAmount = freeItems * item.price;
        totalDiscount += quantityDiscountAmount;
      }
    }

    // Step 3: Apply global discounts to the remaining subtotal using 3-array algorithm
    let remainingPrice = subtotal - totalDiscount;
    if (remainingPrice <= 0) return totalDiscount;

    const globalDiscounts = discounts.filter((d) => !d.isTiedToProduct && (d.type === "PERCENTAGE" || d.type === "FIXED_AMOUNT"));
    totalDiscount += applyThreeBucketAlgorithm(globalDiscounts, remainingPrice);

    return totalDiscount;
  }

  /**
   * Calculate voucher discount amount
   * @param priceAfterDiscounts The price after discount calculations
   * @param voucherIds Array of voucher IDs to apply
   * @param db PrismaClient instance
   * @param shippingCost Shipping cost used for FREEDELIVERY voucher calculation
   * @returns Total voucher discount amount
   */
  private static async calculateVouchers(
    priceAfterDiscounts: number,
    voucherIds: string[],
    db: PrismaClient,
    userId?: string,
    shippingCost: number = 0,
    cartItems?: Array<{ productId: string; quantity: number; price: number }>,
  ): Promise<number> {
    const { VoucherService } = await import("./voucher/voucher.service");
    const { PrismaVoucherRepository } = await import("../repository/voucher/adapter_prisma");
    const voucherRepo = new PrismaVoucherRepository(db);
    const voucherService = new VoucherService(voucherRepo);
    return voucherService.calculateVoucherDiscount(
      voucherIds,
      priceAfterDiscounts,
      userId,
      shippingCost,
      cartItems?.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
    );
  }
}
