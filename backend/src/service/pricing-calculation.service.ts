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
   * Calculate total discount from discount IDs and voucher IDs
   * @param subtotal The base price before any discounts
   * @param discountIds Array of discount IDs to apply
   * @param voucherIds Array of voucher IDs to apply (applied after discounts)
   * @param db PrismaClient instance
   * @param shippingCost Shipping cost used for FREEDELIVERY voucher calculation
   * @returns Total discount amount
   */
  static async calculateTotalDiscount(
    subtotal: number,
    discountIds: string[] | undefined,
    voucherIds: string[] | undefined,
    db: PrismaClient,
    userId?: string,
    shippingCost: number = 0,
  ): Promise<number> {
    let totalDiscount = 0;

    // Calculate discount using percentage and amount discounts (applied before vouchers)
    if (discountIds && discountIds.length > 0) {
      const discountAmount = await this.calculateDiscounts(subtotal, discountIds, db);
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
   * @returns Total discount amount from percentage and fixed amount discounts
   * @note Uses optimal selection: compares best percentage vs best amount discount iteratively
   */
  private static async calculateDiscounts(subtotal: number, discountIds: string[], db: PrismaClient): Promise<number> {
    const discountRepo = new DiscountRepository(db);

    // Fetch all discounts by IDs and filter for active ones
    const allDiscounts = await Promise.all(discountIds.map((id) => discountRepo.getDiscountById(id)));

    // Filter valid discounts: non-null, not vouchers, and currently active
    const now = new Date();
    const discounts = allDiscounts
      .filter((d): d is DiscountResponse => d !== null && !d.isVoucher)
      .filter((d) => {
        const hasStarted = !d.startsAt || d.startsAt <= now;
        const hasNotEnded = !d.endsAt || d.endsAt >= now;
        const available = !d.isLimited || (d.limit !== null && d.useCounter < d.limit);
        return hasStarted && hasNotEnded && available;
      });

    // Separate into percentage and fixed amount discounts, sorted by best value
    const percentageDiscounts = discounts.filter((d) => d.type === "PERCENTAGE").sort((a, b) => Number(b.percentage ?? 0) - Number(a.percentage ?? 0));

    const amountDiscounts = discounts.filter((d) => d.type === "FIXED_AMOUNT").sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));

    let totalDiscount = 0;
    let remainingPrice = subtotal;

    // While both arrays are not empty, compare and choose the best discount
    while (percentageDiscounts.length > 0 && amountDiscounts.length > 0) {
      const pctDiscount = percentageDiscounts[0];
      const amtDiscount = amountDiscounts[0];

      // Calculate the amount for the best percentage discount
      const pctAmount = remainingPrice * (Number(pctDiscount.percentage ?? 0) / 100);
      const amtAmount = amtDiscount.amount ?? 0;

      // Choose the best one
      if (pctAmount >= amtAmount) {
        const actualDiscount = Math.min(pctAmount, remainingPrice);
        if (actualDiscount > 0) {
          totalDiscount += actualDiscount;
          remainingPrice -= actualDiscount;
        }
        percentageDiscounts.shift();
      } else {
        const actualDiscount = Math.min(amtAmount, remainingPrice);
        if (actualDiscount > 0) {
          totalDiscount += actualDiscount;
          remainingPrice -= actualDiscount;
        }
        amountDiscounts.shift();
      }

      if (remainingPrice <= 0) break;
    }

    // Process remaining percentage discounts
    while (percentageDiscounts.length > 0 && remainingPrice > 0) {
      const pctDiscount = percentageDiscounts.shift()!;
      const pctAmount = remainingPrice * (Number(pctDiscount.percentage ?? 0) / 100);
      const actualDiscount = Math.min(pctAmount, remainingPrice);
      if (actualDiscount > 0) {
        totalDiscount += actualDiscount;
        remainingPrice -= actualDiscount;
      }
    }

    // Process remaining amount discounts
    while (amountDiscounts.length > 0 && remainingPrice > 0) {
      const amtDiscount = amountDiscounts.shift()!;
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
