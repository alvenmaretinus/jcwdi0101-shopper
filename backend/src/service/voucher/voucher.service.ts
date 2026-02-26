import { CreateVoucherInput, GetVouchersByFilterInput, UpdateVoucherInput } from "../../schema/voucher/index";
import { VoucherCreateReq, VoucherFilter, VoucherResponse, VoucherUpdateReq } from "../../repository/voucher/entity";
import { Service } from "./interface";
import { VoucherRepo, PaginatedResponse, VoucherQueryOptions } from "../../repository/voucher/interface";
import Decimal from "decimal.js";
import { BadRequestError } from "../../error/BadRequestError";
import { calculateStackedDiscount } from "../../lib/discount/calculateStackedDiscount";
import { DiscountResponse } from "../../repository/discount/entity";

export type VoucherDiscountBreakdown = {
  productDiscount: number;
  shippingDiscount: number;
  totalDiscount: number;
  quantityBonuses: Array<{
    productId: string;
    freeQuantity: number;
  }>;
  appliedVouchers: Array<{
    code: string;
    type: "PRODUCT" | "QUANTITY" | "SHIPPING";
    savedAmount: number;
  }>;
};

export type VoucherCartLine = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export class VoucherService implements Service {
  private repo: VoucherRepo;

  constructor(repo: VoucherRepo) {
    this.repo = repo;
  }

  async createVoucher(data: CreateVoucherInput): Promise<VoucherResponse> {
    const createData: VoucherCreateReq = {
      ...data,
      percentage: data.percentage !== undefined ? new Decimal(data.percentage) : undefined,
      isQuantityLimited: data.voucherType === "REFERRAL" ? true : data.isQuantityLimited,
      maxUses: data.voucherType === "REFERRAL" ? 1 : data.maxUses,
    };
    return this.repo.createVoucher(createData);
  }

  async updateVoucher(data: UpdateVoucherInput): Promise<VoucherResponse> {
    const { id, ...restData } = data;
    const updateData: Partial<VoucherUpdateReq> = {
      ...restData,
      percentage: restData.percentage !== undefined ? new Decimal(restData.percentage) : undefined,
    };
    return this.repo.updateVoucher(id, updateData);
  }

  /**
   * Get vouchers with flexible filtering options.
   * Supports field filters, active date filtering, and pagination.
   */
  async getVouchersByFilter(filter: GetVouchersByFilterInput, options?: VoucherQueryOptions): Promise<PaginatedResponse<VoucherResponse>> {
    const { percentage, page, limit, ...rest } = filter;
    const formattedFilter: Partial<VoucherFilter> = {
      ...rest,
      ...(percentage !== undefined ? { percentage: new Decimal(percentage) } : {}),
    };

    return this.repo.getVouchersByFilter(formattedFilter, { page, limit }, options);
  }

  async getVoucherById(id: string): Promise<VoucherResponse | null> {
    return this.repo.getVoucherById(id);
  }

  async getVoucherByCode(code: string): Promise<VoucherResponse | null> {
    return this.repo.getVoucherByCode(code);
  }

  /**
   * Get multiple vouchers by their IDs.
   * Used for checkout to validate and apply voucher discounts.
   */
  async getVouchersByIds(ids: string[]): Promise<VoucherResponse[]> {
    return this.repo.getVouchersByIds(ids);
  }

  /**
   * Get multiple vouchers by their codes.
   * Used for checkout to validate and apply voucher discounts.
   */
  async getVouchersByCodes(codes: string[]): Promise<VoucherResponse[]> {
    return this.repo.getVouchersByCodes(codes);
  }

  async deleteVoucher(id: string): Promise<void> {
    return this.repo.deleteVoucher(id);
  }

  private normalizeVoucherIdentifiers(voucherIdentifiers: string[]): string[] {
    const seen = new Set<string>();
    const normalized: string[] = [];

    for (const identifier of voucherIdentifiers) {
      const value = identifier.trim();
      if (!value) continue;

      const key = value.toLowerCase();
      if (seen.has(key)) continue;

      seen.add(key);
      normalized.push(value);
    }

    return normalized;
  }

  private calculateFreeDeliveryDiscount(voucher: VoucherResponse, shippingCost: number): number {
    if (shippingCost <= 0) {
      return 0;
    }

    const discount = voucher.discount;
    if (discount.type === "FIXED_AMOUNT") {
      const amount = discount.amount ?? 0;
      // amount=0 means fully free shipping
      const rawDiscount = amount <= 0 ? shippingCost : amount;
      return Math.max(0, Math.min(rawDiscount, shippingCost));
    }

    if (discount.type === "PERCENTAGE") {
      const rawDiscount = shippingCost * (Number(discount.percentage ?? 0) / 100);
      return Math.max(0, Math.min(Math.round(rawDiscount), shippingCost));
    }

    return 0;
  }

  private calculateBestFreeQuantity(quantity: number, rules: Array<{ buyQuantity: number; freeQuantity: number }>): number {
    if (quantity <= 0 || rules.length === 0) {
      return 0;
    }

    let bestFreeQuantity = 0;
    for (const rule of rules) {
      if (rule.buyQuantity <= 0 || rule.freeQuantity <= 0) {
        continue;
      }

      const setsEligible = Math.floor(quantity / rule.buyQuantity);
      const freeUnits = Math.min(quantity, setsEligible * rule.freeQuantity);
      if (freeUnits > bestFreeQuantity) {
        bestFreeQuantity = freeUnits;
      }
    }

    return bestFreeQuantity;
  }

  private calculateQuantityVoucherDiscount(
    vouchers: VoucherResponse[],
    cartItems?: VoucherCartLine[],
  ): {
    discount: number;
    quantityBonuses: Array<{ productId: string; freeQuantity: number }>;
    perVoucherSavings: Array<{ code: string; savedAmount: number }>;
  } {
    if (!cartItems || cartItems.length === 0) {
      return { discount: 0, quantityBonuses: [], perVoucherSavings: [] };
    }

    const quantityVouchers = vouchers.filter((voucher) => {
      return voucher.voucherType !== "FREEDELIVERY" && voucher.discount.type === "QUANTITY";
    });

    if (quantityVouchers.length === 0) {
      return { discount: 0, quantityBonuses: [], perVoucherSavings: [] };
    }

    const quantityBonusByProductId = new Map<string, number>();

    for (const item of cartItems) {
      if (item.quantity <= 0 || item.unitPrice <= 0) {
        continue;
      }

      const applicableVouchers = quantityVouchers.filter((voucher) => {
        const tiedProductId = voucher.discount.productId;
        return !tiedProductId || tiedProductId === item.productId;
      });

      if (applicableVouchers.length === 0) {
        continue;
      }

      let bestFreeQuantity = 0;

      for (const voucher of applicableVouchers) {
        const buyQuantity = voucher.discount.buyQuantity ?? 0;
        const freeQuantity = voucher.discount.freeQuantity ?? 0;
        if (buyQuantity <= 0 || freeQuantity <= 0) {
          continue;
        }

        const voucherFreeQuantity = this.calculateBestFreeQuantity(item.quantity, [
          { buyQuantity, freeQuantity },
        ]);

        if (voucherFreeQuantity > bestFreeQuantity) {
          bestFreeQuantity = voucherFreeQuantity;
        }
      }

      if (bestFreeQuantity <= 0) {
        continue;
      }

      const currentFreeQuantity = quantityBonusByProductId.get(item.productId) ?? 0;
      quantityBonusByProductId.set(item.productId, currentFreeQuantity + bestFreeQuantity);

    }

    return {
      discount: 0,
      quantityBonuses: Array.from(quantityBonusByProductId.entries()).map(([productId, freeQuantity]) => ({ productId, freeQuantity })),
      perVoucherSavings: [],
    };
  }

  /**
   * Calculate voucher discount breakdown.
   * - Non-FREEDELIVERY vouchers reduce item subtotal.
   * - FREEDELIVERY vouchers reduce shipping cost (max one best voucher applied).
   */
  async calculateVoucherDiscountBreakdown(voucherIdentifiers: string[], subtotal: number, userId?: string, shippingCost: number = 0, cartItems?: VoucherCartLine[]): Promise<VoucherDiscountBreakdown> {
    const normalizedIdentifiers = this.normalizeVoucherIdentifiers(voucherIdentifiers ?? []);
    if (normalizedIdentifiers.length === 0) {
      return {
        productDiscount: 0,
        shippingDiscount: 0,
        totalDiscount: 0,
        quantityBonuses: [],
        appliedVouchers: [],
      };
    }

    const [vouchersByIds, vouchersByCodes] = await Promise.all([this.getVouchersByIds(normalizedIdentifiers), this.getVouchersByCodes(normalizedIdentifiers)]);

    const vouchersMap = new Map<string, VoucherResponse>();
    for (const voucher of [...vouchersByIds, ...vouchersByCodes]) {
      vouchersMap.set(voucher.id, voucher);
    }

    const vouchers = Array.from(vouchersMap.values());

    const activeVouchers = vouchers.filter((voucher) => !voucher.isSoftDeleted && !voucher.discount.isSoftDeleted);

    const matchedVoucherKeys = new Set<string>();
    for (const voucher of activeVouchers) {
      matchedVoucherKeys.add(voucher.id.toLowerCase());
      matchedVoucherKeys.add(voucher.code.toLowerCase());
    }

    const invalidOrUnavailableIdentifiers = normalizedIdentifiers.filter((identifier) => !matchedVoucherKeys.has(identifier.toLowerCase()));
    if (invalidOrUnavailableIdentifiers.length > 0) {
      throw new BadRequestError(`Voucher is invalid, unavailable, or already redeemed: ${invalidOrUnavailableIdentifiers.join(", ")}`);
    }

    const unauthorizedAssignedVouchers = activeVouchers.filter((voucher) => voucher.userId !== null && voucher.userId !== userId);

    if (unauthorizedAssignedVouchers.length > 0) {
      throw new BadRequestError("Voucher can only be used by its assigned user");
    }

    const now = new Date();
    const notApplicable: Array<{ code: string; reason: string }> = [];
    const applicableVouchers = activeVouchers.filter((voucher) => {
      const discount = voucher.discount;
      const hasStarted = !discount.startsAt || discount.startsAt <= now;
      const hasNotEnded = !discount.endsAt || discount.endsAt >= now;
      const minimumPassed = !discount.isWithMinimum || discount.minimumPrice === null || subtotal >= discount.minimumPrice;
      const available = !discount.isQuantityLimited || (discount.maxUses !== null && discount.useCounter < discount.maxUses);
      const limitedDiscountAvailable = !discount.hasDiscountAmountCap || discount.maxDiscountAmount !== null;
      let quantityVoucherConditionPassed = true;
      let quantityVoucherReason: string | null = null;

      if (discount.type === "QUANTITY") {
        if (!discount.buyQuantity || !discount.freeQuantity) {
          quantityVoucherConditionPassed = false;
          quantityVoucherReason = "invalid quantity voucher rule";
        } else {
          const candidateItems = (cartItems ?? []).filter((item) => {
            if (item.quantity <= 0) {
              return false;
            }
            if (!discount.productId) {
              return true;
            }
            return item.productId === discount.productId;
          });

          if (candidateItems.length === 0) {
            quantityVoucherConditionPassed = false;
            quantityVoucherReason = "eligible cart item not found";
          } else if (
            !candidateItems.some((item) => item.quantity >= (discount.buyQuantity ?? 0))
          ) {
            quantityVoucherConditionPassed = false;
            quantityVoucherReason = `minimum quantity not met (required qty: ${discount.buyQuantity ?? 0})`;
          }
        }
      }

      const isApplicable =
        hasStarted &&
        hasNotEnded &&
        minimumPassed &&
        available &&
        limitedDiscountAvailable &&
        quantityVoucherConditionPassed;
      if (!isApplicable) {
        let reason = "not applicable";
        if (!hasStarted) reason = "not started yet";
        else if (!hasNotEnded) reason = "expired";
        else if (!minimumPassed) reason = `minimum not met (required: ${discount.minimumPrice ?? "-"})`;
        else if (!available) reason = "no remaining uses";
        else if (!limitedDiscountAvailable) reason = "invalid discount cap configuration";
        else if (!quantityVoucherConditionPassed) reason = quantityVoucherReason ?? "quantity voucher condition not met";
        notApplicable.push({ code: voucher.code, reason });
      }
      return isApplicable;
    });

    if (notApplicable.length > 0) {
      const unique = Array.from(new Map(notApplicable.map((x) => [x.code, x])).values()).map((x) => `${x.code}: ${x.reason}`);
      throw new BadRequestError(`Voucher is not applicable: ${unique.join(", ")}`);
    }

    const productVouchers = applicableVouchers.filter((voucher) => voucher.voucherType !== "FREEDELIVERY");
    const shippingVouchers = applicableVouchers.filter((voucher) => voucher.voucherType === "FREEDELIVERY");
    const appliedVouchers: Array<{
      code: string;
      type: "PRODUCT" | "QUANTITY" | "SHIPPING";
      savedAmount: number;
    }> = [];

    let productDiscount = 0;
    let quantityBonuses: Array<{ productId: string; freeQuantity: number }> = [];
    if (productVouchers.length > 0) {
      const productVoucherMapByDiscountId = new Map<string, VoucherResponse>();
      productVouchers.forEach((voucher) => {
        productVoucherMapByDiscountId.set(voucher.discount.id, voucher);
      });

      const priceDiscounts: DiscountResponse[] = productVouchers
        .filter((voucher) => voucher.discount.type !== "QUANTITY")
        .map(
          (voucher) =>
            ({
              ...voucher.discount,
              name: voucher.discount.name ?? voucher.code ?? "Voucher",
            }) as DiscountResponse,
        );

      const stackedResult = calculateStackedDiscount(subtotal, priceDiscounts);
      const priceDiscount = Math.min(stackedResult.totalDiscount, subtotal);

      stackedResult.appliedDiscounts.forEach((applied) => {
        const sourceVoucher = productVoucherMapByDiscountId.get(applied.id);
        if (!sourceVoucher || applied.savedAmount <= 0) {
          return;
        }

        appliedVouchers.push({
          code: sourceVoucher.code,
          type: "PRODUCT",
          savedAmount: Math.max(0, Math.round(applied.savedAmount)),
        });
      });

      const quantityVoucher = this.calculateQuantityVoucherDiscount(productVouchers, cartItems);

      quantityBonuses = quantityVoucher.quantityBonuses;
      productDiscount = Math.min(subtotal, Math.max(0, priceDiscount + quantityVoucher.discount));
    }

    let shippingDiscount = 0;
    if (shippingCost > 0 && shippingVouchers.length > 0) {
      let bestShippingVoucherCode: string | null = null;
      shippingDiscount = shippingVouchers.reduce((best, voucher) => {
        const candidate = this.calculateFreeDeliveryDiscount(voucher, shippingCost);
        if (candidate > best) {
          bestShippingVoucherCode = voucher.code;
        }
        return Math.max(best, candidate);
      }, 0);
      shippingDiscount = Math.min(shippingDiscount, shippingCost);

      if (bestShippingVoucherCode && shippingDiscount > 0) {
        appliedVouchers.push({
          code: bestShippingVoucherCode,
          type: "SHIPPING",
          savedAmount: Math.max(0, Math.round(shippingDiscount)),
        });
      }
    }

    const mergedAppliedVouchers = Array.from(
      appliedVouchers.reduce((acc, voucher) => {
        const key = `${voucher.code}:${voucher.type}`;
        const existing = acc.get(key);
        if (existing) {
          existing.savedAmount += voucher.savedAmount;
          return acc;
        }
        acc.set(key, { ...voucher });
        return acc;
      }, new Map<string, { code: string; type: "PRODUCT" | "QUANTITY" | "SHIPPING"; savedAmount: number }>() ).values(),
    );

    return {
      productDiscount,
      shippingDiscount,
      totalDiscount: productDiscount + shippingDiscount,
      quantityBonuses,
      appliedVouchers: mergedAppliedVouchers,
    };
  }

  /**
   * Calculate total voucher discount amount.
   * FREEDELIVERY vouchers are applied against shipping cost when provided.
   */
  async calculateVoucherDiscount(voucherIdentifiers: string[], subtotal: number, userId?: string, shippingCost: number = 0, cartItems?: VoucherCartLine[]): Promise<number> {
    const breakdown = await this.calculateVoucherDiscountBreakdown(voucherIdentifiers, subtotal, userId, shippingCost, cartItems);

    return breakdown.totalDiscount;
  }
}
