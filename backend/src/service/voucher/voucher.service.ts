import { CreateVoucherInput, GetVouchersByFilterInput, UpdateVoucherInput } from "../../schema/voucher/index";
import { VoucherCreateReq, VoucherFilter, VoucherResponse, VoucherUpdateReq } from "../../repository/voucher/entity";
import { Service } from "./interface";
import { VoucherRepo, PaginatedResponse, VoucherQueryOptions } from "../../repository/voucher/interface";
import Decimal from "decimal.js";
import { BadRequestError } from "../../error/BadRequestError";
import { calculateStackedDiscount } from "../../lib/discount/calculateStackedDiscount";
import { DiscountResponse } from "../../repository/discount/entity";

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

    /**
     * Calculate total voucher discount for a given subtotal.
     * Vouchers are ranked by highest amount first (business requirement).
     * Only applicable vouchers (meeting minimum price requirement) are applied.
     * 
     * @param voucherIdentifiers Array of voucher IDs or codes to apply
     * @param subtotal Order subtotal amount
     * @param userId Current user ID (required for referral voucher ownership validation)
     * @returns Total discount amount from all applicable vouchers
     */
    async calculateVoucherDiscount(voucherIdentifiers: string[], subtotal: number, userId?: string): Promise<number> {
        if (!voucherIdentifiers || voucherIdentifiers.length === 0) {
            return 0;
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

        // Filter out soft-deleted vouchers
        const activeVouchers = vouchers.filter((voucher) => !voucher.isSoftDeleted && !voucher.discount.isSoftDeleted);

        const unauthorizedReferralVouchers = activeVouchers.filter(
            (voucher) => voucher.voucherType === "REFERRAL" && voucher.userId !== userId
        );

        if (unauthorizedReferralVouchers.length > 0) {
            throw new BadRequestError("Referral voucher can only be used by its assigned user");
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
            return 0;
        }

        const applicableDiscounts: DiscountResponse[] = applicableVouchers.map((voucher) => ({
            ...voucher.discount,
            name: voucher.discount.name ?? voucher.code ?? "Voucher",
            isTiedToProduct: false,
            productId: null,
            buyQuantity: null,
            freeQuantity: null,
        }));

        const stackedResult = calculateStackedDiscount(subtotal, applicableDiscounts);
        return Math.min(stackedResult.totalDiscount, subtotal);
    }
}
