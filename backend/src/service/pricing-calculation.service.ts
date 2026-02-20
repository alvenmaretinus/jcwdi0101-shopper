import { PrismaClient } from "../../prisma/generated/client";
import { PrismaRepository as DiscountRepository } from "../repository/discount/adapter_prisma";
import { DiscountResponse } from "../repository/discount/entity";

export class PricingCalculationService {
  /**
   * Calculate total discount from discount IDs and voucher IDs
   * @param subtotal The base price before any discounts
   * @param discountIds Array of discount IDs to apply
   * @param voucherIds Array of voucher IDs to apply (applied after discounts)
   * @param db PrismaClient instance
   * @returns Total discount amount
   */
  static async calculateTotalDiscount(
    subtotal: number,
    discountIds: string[] | undefined,
    voucherIds: string[] | undefined,
    db: PrismaClient,
    userId?: string,
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
      const voucherAmount = await this.calculateVouchers(priceAfterDiscounts, voucherIds, db, userId);
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
  private static async calculateDiscounts(
    subtotal: number,
    discountIds: string[],
    db: PrismaClient
  ): Promise<number> {
    const discountRepo = new DiscountRepository(db);

    // Fetch all discounts by IDs and filter for active ones
    const allDiscounts = await Promise.all(
      discountIds.map(id => discountRepo.getDiscountById(id))
    );

    // Filter valid discounts: non-null, not vouchers, and currently active
    const now = new Date();
    const discounts = allDiscounts
      .filter((d): d is DiscountResponse => d !== null && !d.isVoucher)
      .filter(d => {
        const hasStarted = !d.startsAt || d.startsAt <= now;
        const hasNotEnded = !d.endsAt || d.endsAt >= now;
        const available = !d.isLimited || (d.limit !== null && d.useCounter < d.limit);
        return hasStarted && hasNotEnded && available;
      });

    // Separate into percentage and fixed amount discounts, sorted by best value
    const percentageDiscounts = discounts
      .filter(d => d.type === 'PERCENTAGE')
      .sort((a, b) => Number(b.percentage ?? 0) - Number(a.percentage ?? 0));

    const amountDiscounts = discounts
      .filter(d => d.type === 'FIXED_AMOUNT')
      .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0));

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
   * @returns Total voucher discount amount
   */
  private static async calculateVouchers(
    priceAfterDiscounts: number,
    voucherIds: string[],
    db: PrismaClient,
    userId?: string,
  ): Promise<number> {
    const { VoucherService } = await import("./voucher/voucher.service");
    const { PrismaVoucherRepository } = await import("../repository/voucher/adapter_prisma");
    const voucherRepo = new PrismaVoucherRepository(db);
    const voucherService = new VoucherService(voucherRepo);
    return voucherService.calculateVoucherDiscount(voucherIds, priceAfterDiscounts, userId);
  }
}
