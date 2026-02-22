import { PrismaClient } from "../../prisma/generated/client";
import { PrismaRepository as DiscountRepository } from "../repository/discount/adapter_prisma";
import { DiscountResponse } from "../repository/discount/entity";
import { calculateStackedDiscount } from "../lib/discount/calculateStackedDiscount";

type ProductLineItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

type ProductPromotionLineBreakdown = {
  productId: string;
  totalDiscount: number;
  bogoFreeQuantity: number;
};

type ProductPromotionBreakdown = {
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

  static async calculateProductPromotionBreakdown(items: ProductLineItem[], db: PrismaClient): Promise<ProductPromotionBreakdown> {
    if (!items || items.length === 0) {
      return { totalDiscount: 0, lines: [] };
    }

    const productIds = Array.from(new Set(items.map((item) => item.productId)));
    if (productIds.length === 0) {
      return { totalDiscount: 0, lines: [] };
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
    })) as DiscountResponse[];

    const discountsByProduct = new Map<string, DiscountResponse[]>();
    discounts.forEach((discount) => {
      if (!discount.productId) return;
      const current = discountsByProduct.get(discount.productId) ?? [];
      current.push(discount);
      discountsByProduct.set(discount.productId, current);
    });

    let totalDiscount = 0;
    const lines: ProductPromotionLineBreakdown[] = [];

    for (const item of items) {
      if (item.quantity <= 0 || item.unitPrice <= 0) {
        lines.push({
          productId: item.productId,
          totalDiscount: 0,
          bogoFreeQuantity: 0,
        });
        continue;
      }

      const lineSubtotal = item.unitPrice * item.quantity;
      const availableDiscounts = (discountsByProduct.get(item.productId) ?? []).filter((discount) => {
        const available = !discount.isLimited || (discount.limit !== null && discount.useCounter < discount.limit);
        const minimumPassed = !discount.isWithMinimum || discount.minimumPrice === null || lineSubtotal >= discount.minimumPrice;
        return available && minimumPassed;
      });

      if (availableDiscounts.length === 0) {
        lines.push({
          productId: item.productId,
          totalDiscount: 0,
          bogoFreeQuantity: 0,
        });
        continue;
      }

      const stacked = calculateStackedDiscount(item.unitPrice, availableDiscounts);

      const unitPriceAfterPriceDiscount = stacked.discountedPrice;
      const perUnitDiscount = Math.max(0, item.unitPrice - unitPriceAfterPriceDiscount);
      const priceDiscountTotal = perUnitDiscount * item.quantity;

      const bogoFreeQuantity = this.calculateBestBogoFreeQuantity(item.quantity, stacked.quantityDiscounts);
      // BOGO doesn't reduce the price user pays - they get bonus items for free
      // So bogoDiscountTotal should be 0 for pricing but bogoFreeQuantity tracks bonus items for stock
      const bogoDiscountTotal = 0;

      const lineDiscount = priceDiscountTotal + bogoDiscountTotal;
      totalDiscount += lineDiscount;

      lines.push({
        productId: item.productId,
        totalDiscount: Math.round(lineDiscount),
        bogoFreeQuantity,
      });
    }

    return {
      totalDiscount: Math.round(totalDiscount),
      lines,
    };
  }

  static async calculateProductPromotionDiscount(items: ProductLineItem[], db: PrismaClient): Promise<number> {
    const breakdown = await this.calculateProductPromotionBreakdown(items, db);
    return breakdown.totalDiscount;
  }

  /**
   * Resolve active non-voucher global discounts that should be auto-applied
   * during cart/checkout pricing.
   */
  static async getAutoAppliedGlobalDiscountIds(
    subtotal: number,
    db: PrismaClient,
  ): Promise<string[]> {
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
        isLimited: true,
        limit: true,
        useCounter: true,
        isLimitedDiscount: true,
        discountLimitAmt: true,
      },
    });

    return discounts
      .filter((discount) => {
        const minimumPassed =
          !discount.isWithMinimum ||
          discount.minimumPrice === null ||
          subtotal >= discount.minimumPrice;
        const available =
          !discount.isLimited ||
          (discount.limit !== null && discount.useCounter < discount.limit);
        const limitedDiscountAvailable =
          !discount.isLimitedDiscount ||
          (discount.discountLimitAmt !== null &&
            discount.useCounter < discount.discountLimitAmt);

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
      const voucherAmount = await this.calculateVouchers(
        priceAfterDiscounts,
        voucherIds,
        db,
        userId,
        shippingCost,
      );
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
  private static async calculateDiscounts(
    subtotal: number,
    discountIds: string[],
    db: PrismaClient,
    cartItems?: Array<{ productId: string; quantity: number; price: number }>,
  ): Promise<number> {
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
        const available = !d.isLimited || (d.limit !== null && d.useCounter < d.limit);
        const limitedDiscountAvailable = !d.isLimitedDiscount || (d.discountLimitAmt !== null && d.useCounter < d.discountLimitAmt);
        return hasStarted && hasNotEnded && minimumMet && available && limitedDiscountAvailable;
      });

    // Separate discounts by type
    const globalPercentageDiscounts = discounts
      .filter((d) => d.type === "PERCENTAGE" && !d.isTiedToProduct)
      .sort((a, b) => Number(b.percentage ?? 0) - Number(a.percentage ?? 0));

    const globalAmountDiscounts = discounts
      .filter((d) => d.type === "FIXED_AMOUNT" && !d.isTiedToProduct)
      .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));

    const productSpecificDiscounts = discounts.filter(d => d.isTiedToProduct && d.productId);
    const quantityDiscounts = discounts.filter(d => d.type === 'QUANTITY' && d.buyQuantity && d.freeQuantity && d.productId);

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
        const itemPctDiscounts = itemDiscounts
          .filter(d => d.type === 'PERCENTAGE')
          .sort((a, b) => Number(b.percentage ?? 0) - Number(a.percentage ?? 0));
        const itemAmtDiscounts = itemDiscounts
          .filter(d => d.type === 'FIXED_AMOUNT')
          .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));

        let itemDiscountAmount = 0;
        let remainingItemPrice = itemTotal;

        // Apply discounts alternately (same logic as global)
        while (itemPctDiscounts.length > 0 && itemAmtDiscounts.length > 0 && remainingItemPrice > 0) {
          const pctDiscount = itemPctDiscounts[0];
          const amtDiscount = itemAmtDiscounts[0];

          const pctAmount = remainingItemPrice * (Number(pctDiscount.percentage ?? 0) / 100);
          const amtAmount = amtDiscount.amount ?? 0;

          if (pctAmount >= amtAmount) {
            const actualDiscount = Math.min(pctAmount, remainingItemPrice);
            if (actualDiscount > 0) {
              itemDiscountAmount += actualDiscount;
              remainingItemPrice -= actualDiscount;
            }
            itemPctDiscounts.shift();
          } else {
            const actualDiscount = Math.min(amtAmount, remainingItemPrice);
            if (actualDiscount > 0) {
              itemDiscountAmount += actualDiscount;
              remainingItemPrice -= actualDiscount;
            }
            itemAmtDiscounts.shift();
          }
        }

        // Apply remaining percentage discounts
        while (itemPctDiscounts.length > 0 && remainingItemPrice > 0) {
          const pctDiscount = itemPctDiscounts.shift()!;
          const pctAmount = remainingItemPrice * (Number(pctDiscount.percentage ?? 0) / 100);
          const actualDiscount = Math.min(pctAmount, remainingItemPrice);
          if (actualDiscount > 0) {
            itemDiscountAmount += actualDiscount;
            remainingItemPrice -= actualDiscount;
          }
        }

        // Apply remaining amount discounts
        while (itemAmtDiscounts.length > 0 && remainingItemPrice > 0) {
          const amtDiscount = itemAmtDiscounts.shift()!;
          const amtAmount = amtDiscount.amount ?? 0;
          const actualDiscount = Math.min(amtAmount, remainingItemPrice);
          if (actualDiscount > 0) {
            itemDiscountAmount += actualDiscount;
            remainingItemPrice -= actualDiscount;
          }
        }

        totalDiscount += itemDiscountAmount;
      }
    }

    // Step 2: Handle QUANTITY discounts (buy X get Y free) - these reduce effective price
    if (cartItems && cartItems.length > 0 && quantityDiscounts.length > 0) {
      for (const discount of quantityDiscounts) {
        const item = cartItems.find(ci => ci.productId === discount.productId);
        if (!item || !discount.buyQuantity || !discount.freeQuantity) continue;

        const setsEligible = Math.floor(item.quantity / discount.buyQuantity);
        const freeItems = setsEligible * discount.freeQuantity;
        const quantityDiscountAmount = freeItems * item.price;
        totalDiscount += quantityDiscountAmount;
      }
    }

    // Step 3: Apply global discounts to the remaining subtotal
    let remainingPrice = subtotal - totalDiscount;
    if (remainingPrice <= 0) return totalDiscount;

    // Alternate between global percentage and amount discounts
    while (globalPercentageDiscounts.length > 0 && globalAmountDiscounts.length > 0 && remainingPrice > 0) {
      const pctDiscount = globalPercentageDiscounts[0];
      const amtDiscount = globalAmountDiscounts[0];

      const pctAmount = remainingPrice * (Number(pctDiscount.percentage ?? 0) / 100);
      const amtAmount = amtDiscount.amount ?? 0;

      if (pctAmount >= amtAmount) {
        const actualDiscount = Math.min(pctAmount, remainingPrice);
        if (actualDiscount > 0) {
          totalDiscount += actualDiscount;
          remainingPrice -= actualDiscount;
        }
        globalPercentageDiscounts.shift();
      } else {
        const actualDiscount = Math.min(amtAmount, remainingPrice);
        if (actualDiscount > 0) {
          totalDiscount += actualDiscount;
          remainingPrice -= actualDiscount;
        }
        globalAmountDiscounts.shift();
      }
    }

    // Process remaining global percentage discounts
    while (globalPercentageDiscounts.length > 0 && remainingPrice > 0) {
      const pctDiscount = globalPercentageDiscounts.shift()!;
      const pctAmount = remainingPrice * (Number(pctDiscount.percentage ?? 0) / 100);
      const actualDiscount = Math.min(pctAmount, remainingPrice);
      if (actualDiscount > 0) {
        totalDiscount += actualDiscount;
        remainingPrice -= actualDiscount;
      }
    }

    // Process remaining global amount discounts
    while (globalAmountDiscounts.length > 0 && remainingPrice > 0) {
      const amtDiscount = globalAmountDiscounts.shift()!;
      const amtAmount = amtDiscount.amount ?? 0;
      const actualDiscount = Math.min(amtAmount, remainingPrice);
      if (actualDiscount > 0) {
        totalDiscount += actualDiscount;
        remainingPrice -= actualDiscount;
      }
    }

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
    );
  }
}
