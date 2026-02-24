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
            isQuantityLimited: data.voucherType === 'REFERRAL' ? true : data.isQuantityLimited,
            maxUses: data.voucherType === 'REFERRAL' ? 1 : data.maxUses,
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

    private calculateBestFreeQuantity(
        quantity: number,
        rules: Array<{ buyQuantity: number; freeQuantity: number }>,
    ): number {
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
    } {
        if (!cartItems || cartItems.length === 0) {
            return { discount: 0, quantityBonuses: [] };
        }

        const quantityVouchers = vouchers.filter((voucher) => {
            return (
                voucher.voucherType !== "FREEDELIVERY" &&
                voucher.discount.type === "QUANTITY"
            );
        });

        if (quantityVouchers.length === 0) {
            return { discount: 0, quantityBonuses: [] };
        }

        let totalDiscount = 0;
        const quantityBonusByProductId = new Map<string, number>();

        for (const item of cartItems) {
            if (item.quantity <= 0 || item.unitPrice <= 0) {
                continue;
            }

            const applicableRules = quantityVouchers
                .filter((voucher) => {
                    const tiedProductId = voucher.discount.productId;
                    return !tiedProductId || tiedProductId === item.productId;
                })
                .map((voucher) => ({
                    buyQuantity: voucher.discount.buyQuantity ?? 0,
                    freeQuantity: voucher.discount.freeQuantity ?? 0,
                }))
                .filter((rule) => rule.buyQuantity > 0 && rule.freeQuantity > 0);

            if (applicableRules.length === 0) {
                continue;
            }

            const bestFreeQuantity = this.calculateBestFreeQuantity(
                item.quantity,
                applicableRules,
            );
            if (bestFreeQuantity <= 0) {
                continue;
            }

            totalDiscount += bestFreeQuantity * item.unitPrice;
            const currentFreeQuantity =
                quantityBonusByProductId.get(item.productId) ?? 0;
            quantityBonusByProductId.set(
                item.productId,
                currentFreeQuantity + bestFreeQuantity,
            );
        }

        return {
            discount: Math.max(0, Math.round(totalDiscount)),
            quantityBonuses: Array.from(quantityBonusByProductId.entries()).map(
                ([productId, freeQuantity]) => ({ productId, freeQuantity }),
            ),
        };
    }

    /**
     * Calculate voucher discount breakdown.
     * - Non-FREEDELIVERY vouchers reduce item subtotal.
     * - FREEDELIVERY vouchers reduce shipping cost (max one best voucher applied).
     */
    async calculateVoucherDiscountBreakdown(
        voucherIdentifiers: string[],
        subtotal: number,
        userId?: string,
        shippingCost: number = 0,
        cartItems?: VoucherCartLine[],
    ): Promise<VoucherDiscountBreakdown> {
        const normalizedIdentifiers = this.normalizeVoucherIdentifiers(voucherIdentifiers ?? []);
        if (normalizedIdentifiers.length === 0) {
            return {
                productDiscount: 0,
                shippingDiscount: 0,
                totalDiscount: 0,
                quantityBonuses: [],
            };
        }

        const [vouchersByIds, vouchersByCodes] = await Promise.all([
            this.getVouchersByIds(normalizedIdentifiers),
            this.getVouchersByCodes(normalizedIdentifiers),
        ]);

        const vouchersMap = new Map<string, VoucherResponse>();
        for (const voucher of [...vouchersByIds, ...vouchersByCodes]) {
            vouchersMap.set(voucher.id, voucher);
        }

        const vouchers = Array.from(vouchersMap.values());

        const activeVouchers = vouchers.filter(
            (voucher) => !voucher.isSoftDeleted && !voucher.discount.isSoftDeleted
        );

        const matchedVoucherKeys = new Set<string>();
        for (const voucher of activeVouchers) {
            matchedVoucherKeys.add(voucher.id.toLowerCase());
            matchedVoucherKeys.add(voucher.code.toLowerCase());
        }

        const invalidOrUnavailableIdentifiers = normalizedIdentifiers.filter(
            (identifier) => !matchedVoucherKeys.has(identifier.toLowerCase())
        );
        if (invalidOrUnavailableIdentifiers.length > 0) {
            throw new BadRequestError(
                `Voucher is invalid, unavailable, or already redeemed: ${invalidOrUnavailableIdentifiers.join(", ")}`,
            );
        }

        const unauthorizedAssignedVouchers = activeVouchers.filter(
            (voucher) => voucher.userId !== null && voucher.userId !== userId
        );

        if (unauthorizedAssignedVouchers.length > 0) {
            throw new BadRequestError("Voucher can only be used by its assigned user");
        }

        const now = new Date();
        const notApplicableVoucherCodes: string[] = [];
        const applicableVouchers = activeVouchers.filter((voucher) => {
            const discount = voucher.discount;
            const hasStarted = !discount.startsAt || discount.startsAt <= now;
            const hasNotEnded = !discount.endsAt || discount.endsAt >= now;
            const minimumPassed = !discount.isWithMinimum || discount.minimumPrice === null || subtotal >= discount.minimumPrice;
            const available = !discount.isQuantityLimited || (discount.maxUses !== null && discount.useCounter < discount.maxUses);
            const limitedDiscountAvailable = !discount.hasDiscountAmountCap || (discount.maxDiscountAmount !== null);
            const isApplicable =
                hasStarted &&
                hasNotEnded &&
                minimumPassed &&
                available &&
                limitedDiscountAvailable;
            if (!isApplicable) {
                notApplicableVoucherCodes.push(voucher.code);
            }
            return isApplicable;
        });

        if (notApplicableVoucherCodes.length > 0) {
            const uniqueNotApplicableVoucherCodes = Array.from(new Set(notApplicableVoucherCodes));
            throw new BadRequestError(
                `Voucher is not applicable: ${uniqueNotApplicableVoucherCodes.join(", ")}`,
            );
        }

        const productVouchers = applicableVouchers.filter(
            (voucher) => voucher.voucherType !== "FREEDELIVERY"
        );
        const shippingVouchers = applicableVouchers.filter(
            (voucher) => voucher.voucherType === "FREEDELIVERY"
        );

        let productDiscount = 0;
        let quantityBonuses: Array<{ productId: string; freeQuantity: number }> = [];
        if (productVouchers.length > 0) {
            const priceDiscounts: DiscountResponse[] = productVouchers
                .filter((voucher) => voucher.discount.type !== "QUANTITY")
                .map((voucher) => ({
                    ...voucher.discount,
                    name: voucher.discount.name ?? voucher.code ?? "Voucher",
                } as DiscountResponse));

            const stackedResult = calculateStackedDiscount(subtotal, priceDiscounts);
            const priceDiscount = Math.min(stackedResult.totalDiscount, subtotal);

            const quantityVoucher = this.calculateQuantityVoucherDiscount(
                productVouchers,
                cartItems,
            );

            quantityBonuses = quantityVoucher.quantityBonuses;
            productDiscount = Math.min(
                subtotal,
                Math.max(0, priceDiscount + quantityVoucher.discount),
            );
        }

        let shippingDiscount = 0;
        if (shippingCost > 0 && shippingVouchers.length > 0) {
            shippingDiscount = shippingVouchers.reduce((best, voucher) => {
                const candidate = this.calculateFreeDeliveryDiscount(voucher, shippingCost);
                return Math.max(best, candidate);
            }, 0);
            shippingDiscount = Math.min(shippingDiscount, shippingCost);
        }

        return {
            productDiscount,
            shippingDiscount,
            totalDiscount: productDiscount + shippingDiscount,
            quantityBonuses,
        };
    }

    /**
     * Calculate total voucher discount amount.
     * FREEDELIVERY vouchers are applied against shipping cost when provided.
     */
    async calculateVoucherDiscount(
        voucherIdentifiers: string[],
        subtotal: number,
        userId?: string,
        shippingCost: number = 0,
        cartItems?: VoucherCartLine[],
    ): Promise<number> {
        const breakdown = await this.calculateVoucherDiscountBreakdown(
            voucherIdentifiers,
            subtotal,
            userId,
            shippingCost,
            cartItems,
        );

        return breakdown.totalDiscount;
    }
}
