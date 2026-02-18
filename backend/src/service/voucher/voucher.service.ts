import { CreateVoucherInput, GetVouchersByFilterInput, UpdateVoucherInput } from "../../schema/voucher/index";
import { VoucherCreateReq, VoucherFilter, VoucherResponse, VoucherUpdateReq } from "../../repository/voucher/entity";
import { Service } from "./interface";
import { VoucherRepo, PaginatedResponse } from "../../repository/voucher/interface";
import Decimal from "decimal.js";

export class VoucherService implements Service {
    private repo: VoucherRepo;

    constructor(repo: VoucherRepo) {
        this.repo = repo;
    }

    async createVoucher(data: CreateVoucherInput): Promise<VoucherResponse> {
        const createData: VoucherCreateReq = {
            ...data,
            percentage: data.percentage !== undefined ? new Decimal(data.percentage) : undefined,
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
    async getVouchersByFilter(filter: GetVouchersByFilterInput): Promise<PaginatedResponse<VoucherResponse>> {
        const { percentage, page, limit, ...rest } = filter;
        const formattedFilter: Partial<VoucherFilter> = {
            ...rest,
            ...(percentage !== undefined ? { percentage: new Decimal(percentage) } : {}),
        };

        return this.repo.getVouchersByFilter(formattedFilter, { page, limit });
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
     * @param voucherCodes Array of voucher codes to apply
     * @param subtotal Order subtotal amount
     * @returns Total discount amount from all applicable vouchers
     */
    async calculateVoucherDiscount(voucherCodes: string[], subtotal: number): Promise<number> {
        if (!voucherCodes || voucherCodes.length === 0) {
            return 0;
        }

        const vouchers = await this.getVouchersByCodes(voucherCodes);

        // Filter out vouchers that don't meet minimum price requirement
        const applicableVouchers = vouchers.filter(v => {
            if (v.discount.isWithMinimum && v.discount.minimumPrice !== null) {
                return subtotal >= v.discount.minimumPrice;
            }
            return true;
        });

        // Calculate discount for each voucher
        const vouchersWithDiscount = applicableVouchers.map(v => {
            let discount = 0;
            if (v.discount.type === 'PERCENTAGE' && v.discount.percentage !== null) {
                discount = Math.floor((subtotal * Number(v.discount.percentage)) / 100);
            } else if (v.discount.type === 'FIXED_AMOUNT' && v.discount.amount !== null) {
                discount = v.discount.amount;
            }
            return { ...v, calculatedDiscount: discount };
        });

        // Sort by highest discount amount first (business requirement)
        vouchersWithDiscount.sort((a, b) => b.calculatedDiscount - a.calculatedDiscount);

        // Sum all applicable discounts
        const totalDiscount = vouchersWithDiscount.reduce((sum, v) => sum + v.calculatedDiscount, 0);

        // Ensure discount doesn't exceed subtotal
        return Math.min(totalDiscount, subtotal);
    }
}
