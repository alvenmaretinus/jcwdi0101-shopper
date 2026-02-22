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
            isLimited: data.voucherType === 'REFERRAL' ? true : data.isLimited,
            limit: data.voucherType === 'REFERRAL' ? 1 : data.limit,
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
    ): Promise<VoucherDiscountBreakdown> {
        if (!voucherIdentifiers || voucherIdentifiers.length === 0) {
            return { productDiscount: 0, shippingDiscount: 0, totalDiscount: 0 };
        }

        const [vouchersByIds, vouchersByCodes] = await Promise.all([
            this.getVouchersByIds(voucherIdentifiers),
            this.getVouchersByCodes(voucherIdentifiers),
        ]);

        const vouchersMap = new Map<string, VoucherResponse>();
        for (const voucher of [...vouchersByIds, ...vouchersByCodes]) {
            vouchersMap.set(voucher.id, voucher);
        }

        const vouchers = Array.from(vouchersMap.values());

        const activeVouchers = vouchers.filter(
            (voucher) => !voucher.isSoftDeleted && !voucher.discount.isSoftDeleted
        );

        const unauthorizedAssignedVouchers = activeVouchers.filter(
            (voucher) => voucher.userId !== null && voucher.userId !== userId
        );

        if (unauthorizedAssignedVouchers.length > 0) {
            throw new BadRequestError("Voucher can only be used by its assigned user");
        }

        const now = new Date();
        const applicableVouchers = activeVouchers.filter((voucher) => {
            const discount = voucher.discount;
            const hasStarted = !discount.startsAt || discount.startsAt <= now;
            const hasNotEnded = !discount.endsAt || discount.endsAt >= now;
            const minimumPassed = !discount.isWithMinimum || discount.minimumPrice === null || subtotal >= discount.minimumPrice;
            const available = !discount.isLimited || (discount.limit !== null && discount.useCounter < discount.limit);
            const limitedDiscountAvailable = !discount.isLimitedDiscount || (discount.discountLimitAmt !== null && discount.useCounter < discount.discountLimitAmt);
            return hasStarted && hasNotEnded && minimumPassed && available && limitedDiscountAvailable;
        });

        if (applicableVouchers.length === 0) {
            return { productDiscount: 0, shippingDiscount: 0, totalDiscount: 0 };
        }

        const productVouchers = applicableVouchers.filter(
            (voucher) => voucher.voucherType !== "FREEDELIVERY"
        );
        const shippingVouchers = applicableVouchers.filter(
            (voucher) => voucher.voucherType === "FREEDELIVERY"
        );

        let productDiscount = 0;
        if (productVouchers.length > 0) {
            const applicableDiscounts: DiscountResponse[] = productVouchers.map((voucher) => ({
                ...voucher.discount,
                name: voucher.discount.name ?? voucher.code ?? "Voucher",
                isTiedToProduct: false,
                productId: null,
                buyQuantity: null,
                freeQuantity: null,
            }));

            const stackedResult = calculateStackedDiscount(subtotal, applicableDiscounts);
            productDiscount = Math.min(stackedResult.totalDiscount, subtotal);
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
    ): Promise<number> {
        const breakdown = await this.calculateVoucherDiscountBreakdown(
            voucherIdentifiers,
            subtotal,
            userId,
            shippingCost,
        );

        return breakdown.totalDiscount;
    }
}
