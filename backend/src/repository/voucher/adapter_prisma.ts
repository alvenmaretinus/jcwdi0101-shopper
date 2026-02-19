import { VoucherCreateReq, VoucherUpdateReq, VoucherResponse, VoucherFilter } from "./entity";
import { VoucherRepo, PaginationParams, PaginatedResponse, VoucherQueryOptions } from "./interface";
import { PrismaClient, Prisma } from "../../../prisma/generated/client";
import { DiscountType, VoucherType, ReferralVoucherRole } from "../../../prisma/generated/enums";

export class PrismaVoucherRepository implements VoucherRepo {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    private isDiscountAvailable(voucher: VoucherResponse): boolean {
        if (!voucher.discount.isLimited) return true;
        if (voucher.discount.limit === null) return false;
        return voucher.discount.useCounter < voucher.discount.limit;
    }

    private setDefined(target: Record<string, unknown>, key: string, value: unknown): void {
        if (value !== undefined) target[key] = value;
    }

    private buildDiscountCreateData(data: VoucherCreateReq): Prisma.DiscountCreateInput {
        return {
            name: data.name, percentage: data.percentage, amount: data.amount, type: data.type as DiscountType,
            isVoucher: true, isWithMinimum: data.isWithMinimum, minimumPrice: data.minimumPrice,
            isLimited: data.isLimited, limit: data.limit, isTiedToProduct: false,
            startsAt: data.startsAt, endsAt: data.endsAt,
        };
    }

    private buildVoucherCreateData(data: VoucherCreateReq, discountId: string): Prisma.VoucherCreateInput {
        return {
            code: data.code,
            userId: data.userId,
            discount: { connect: { id: discountId } },
            voucherType: data.voucherType as VoucherType,
            referralRole: data.referralRole as ReferralVoucherRole | undefined,
        };
    }

    private async createVoucherTx(tx: Prisma.TransactionClient, data: VoucherCreateReq): Promise<VoucherResponse> {
        const discount = await tx.discount.create({ data: this.buildDiscountCreateData(data) });
        return tx.voucher.create({
            data: this.buildVoucherCreateData(data, discount.id),
            include: { discount: true },
        }) as Promise<VoucherResponse>;
    }

    async createVoucher(data: VoucherCreateReq): Promise<VoucherResponse> {
        const result = await this.prisma.$transaction((tx) => this.createVoucherTx(tx, data));
        return result as VoucherResponse;
    }

    private buildDiscountUpdateData(data: Partial<VoucherUpdateReq>): Prisma.DiscountUpdateInput {
        const updateData: Record<string, unknown> = {};
        this.setDefined(updateData, "name", data.name);
        this.setDefined(updateData, "percentage", data.percentage);
        this.setDefined(updateData, "amount", data.amount);
        this.setDefined(updateData, "type", data.type as DiscountType | undefined);
        this.setDefined(updateData, "isWithMinimum", data.isWithMinimum);
        this.setDefined(updateData, "minimumPrice", data.minimumPrice);
        this.setDefined(updateData, "isLimited", data.isLimited);
        this.setDefined(updateData, "limit", data.limit);
        this.setDefined(updateData, "startsAt", data.startsAt);
        this.setDefined(updateData, "endsAt", data.endsAt);
        return updateData as Prisma.DiscountUpdateInput;
    }

    private buildVoucherUpdateData(data: Partial<VoucherUpdateReq>): Prisma.VoucherUpdateInput {
        const updateData: Record<string, unknown> = {};
        this.setDefined(updateData, "voucherType", data.voucherType as VoucherType | undefined);
        this.setDefined(updateData, "code", data.code);
        this.setDefined(updateData, "userId", data.userId);
        this.setDefined(updateData, "referralRole", data.referralRole as ReferralVoucherRole | undefined);
        return updateData as Prisma.VoucherUpdateInput;
    }

    private async updateVoucherTx(tx: Prisma.TransactionClient, id: string, data: Partial<VoucherUpdateReq>): Promise<VoucherResponse> {
        const existingVoucher = await tx.voucher.findUniqueOrThrow({ where: { id }, include: { discount: true } });
        const discountUpdateData = this.buildDiscountUpdateData(data);
        if (Object.keys(discountUpdateData).length > 0) {
            await tx.discount.update({ where: { id: existingVoucher.discountId }, data: discountUpdateData });
        }
        return this.updateVoucherRecord(tx, id, data);
    }

    private updateVoucherRecord(
        tx: Prisma.TransactionClient,
        id: string,
        data: Partial<VoucherUpdateReq>
    ): Promise<VoucherResponse> {
        return tx.voucher.update({ where: { id }, data: this.buildVoucherUpdateData(data), include: { discount: true } }) as Promise<VoucherResponse>;
    }

    async updateVoucher(id: string, data: Partial<VoucherUpdateReq>): Promise<VoucherResponse> {
        const result = await this.prisma.$transaction((tx) => this.updateVoucherTx(tx, id, data));
        return result as VoucherResponse;
    }

    /**
     * Build OR condition for startsAt date filtering.
     */
    private buildStartsAtCondition(activeOnDate: Date): Prisma.DiscountWhereInput[] {
        const startsAtIsNull: Prisma.DiscountWhereInput = { startsAt: null };
        const startsAtLte: Prisma.DiscountWhereInput = { startsAt: { lte: activeOnDate } };
        return [startsAtIsNull, startsAtLte];
    }

    /**
     * Build OR condition for endsAt date filtering.
     */
    private buildEndsAtCondition(activeOnDate: Date): Prisma.DiscountWhereInput[] {
        const endsAtIsNull: Prisma.DiscountWhereInput = { endsAt: null };
        const endsAtGte: Prisma.DiscountWhereInput = { endsAt: { gte: activeOnDate } };
        return [endsAtIsNull, endsAtGte];
    }

    /**
     * Build complete date range filter for active vouchers.
     */
    private buildActiveDateFilter(activeOnDate: Date): Prisma.DiscountWhereInput[] {
        const startsAtOrConditions: Prisma.DiscountWhereInput[] = this.buildStartsAtCondition(activeOnDate);
        const endsAtOrConditions: Prisma.DiscountWhereInput[] = this.buildEndsAtCondition(activeOnDate);

        const startsAtCondition: Prisma.DiscountWhereInput = { OR: startsAtOrConditions };
        const endsAtCondition: Prisma.DiscountWhereInput = { OR: endsAtOrConditions };

        return [startsAtCondition, endsAtCondition];
    }

    private buildReferralVisibilityFilter(
        userId: string | undefined,
        includeAllReferral: boolean
    ): Prisma.VoucherWhereInput {
        if (includeAllReferral) return {};
        if (!userId) return { voucherType: { not: "REFERRAL" } };
        return {
            OR: [
                { voucherType: { not: "REFERRAL" } },
                { voucherType: "REFERRAL", userId },
            ],
        };
    }

    private buildDiscountFilter(filter: Partial<VoucherFilter>): Prisma.DiscountWhereInput {
        const discountFilter: Record<string, unknown> = { isVoucher: true, isSoftDeleted: false };
        if (filter.name !== undefined) discountFilter.name = { contains: filter.name, mode: "insensitive" };
        this.setDefined(discountFilter, "percentage", filter.percentage);
        this.setDefined(discountFilter, "amount", filter.amount);
        this.setDefined(discountFilter, "type", filter.type as DiscountType | undefined);
        this.setDefined(discountFilter, "isWithMinimum", filter.isWithMinimum);
        this.setDefined(discountFilter, "minimumPrice", filter.minimumPrice);
        if (filter.activeOnDate) discountFilter.AND = this.buildActiveDateFilter(filter.activeOnDate);
        return discountFilter as Prisma.DiscountWhereInput;
    }

    /**
     * Format filter to support both regular field filtering AND active date filtering.
     * Special handling: Referral vouchers are only visible to their designated user.
     */
    private formatFilter(filter: Partial<VoucherFilter>, options?: VoucherQueryOptions): Prisma.VoucherWhereInput {
        const { userId, ...voucherFields } = filter;
        const includeAllReferral = options?.includeAllReferral === true;
        const formattedFilter: Prisma.VoucherWhereInput = {
            ...voucherFields,
            ...this.buildReferralVisibilityFilter(userId, includeAllReferral),
            discount: this.buildDiscountFilter(filter),
        };
        return formattedFilter;
    }

    private getPagination(pagination?: PaginationParams): { page: number; limit: number; skip: number } {
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 20;
        return { page, limit, skip: (page - 1) * limit };
    }

    private withSoftDeleteFilter(formattedFilter: Prisma.VoucherWhereInput): Prisma.VoucherWhereInput {
        return {
            ...formattedFilter,
            isSoftDeleted: false,
            discount: { ...((formattedFilter.discount as Record<string, unknown>) || {}), isSoftDeleted: false },
        };
    }

    private async findActiveVoucher(where: Prisma.VoucherWhereInput): Promise<VoucherResponse | null> {
        const voucher = await this.prisma.voucher.findFirst({ where, include: { discount: true } });
        if (!voucher) return null;
        const castedVoucher = voucher as VoucherResponse;
        return this.isDiscountAvailable(castedVoucher) ? castedVoucher : null;
    }

    private async queryVouchers(where: Prisma.VoucherWhereInput, skip: number, limit: number): Promise<[VoucherResponse[], number]> {
        const [vouchers, total] = await Promise.all([
            this.prisma.voucher.findMany({ where, include: { discount: true }, skip, take: limit }),
            this.prisma.voucher.count({ where }),
        ]);
        return [vouchers as VoucherResponse[], total];
    }

    private buildPaginatedResult(data: VoucherResponse[], page: number, limit: number, total: number): PaginatedResponse<VoucherResponse> {
        return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }

    async getVouchersByFilter(filter: Partial<VoucherFilter>, pagination?: PaginationParams, options?: VoucherQueryOptions): Promise<PaginatedResponse<VoucherResponse>> {
        const { page, limit, skip } = this.getPagination(pagination);
        const where = this.withSoftDeleteFilter(this.formatFilter(filter, options));
        const [vouchers, total] = await this.queryVouchers(where, skip, limit);
        const availableVouchers = vouchers.filter((voucher) => this.isDiscountAvailable(voucher));
        return this.buildPaginatedResult(availableVouchers, page, limit, total);
    }

    async getVoucherById(id: string): Promise<VoucherResponse | null> {
        return this.findActiveVoucher({
            id,
            isSoftDeleted: false,
            discount: { isSoftDeleted: false },
        });
    }

    async getVoucherByCode(code: string): Promise<VoucherResponse | null> {
        return this.findActiveVoucher({
            code,
            isSoftDeleted: false,
            discount: { isSoftDeleted: false },
        });
    }

    async getVouchersByIds(ids: string[]): Promise<VoucherResponse[]> {
        const vouchers = await this.prisma.voucher.findMany({
            where: { 
                id: { in: ids },
                isSoftDeleted: false,
                discount: {
                    isSoftDeleted: false,
                },
            },
            include: {
                discount: true,
            },
        });
        return (vouchers as VoucherResponse[]).filter((voucher) => this.isDiscountAvailable(voucher));
    }

    async getVouchersByCodes(codes: string[]): Promise<VoucherResponse[]> {
        const vouchers = await this.prisma.voucher.findMany({
            where: { 
                code: { in: codes },
                isSoftDeleted: false,
                discount: {
                    isSoftDeleted: false,
                },
            },
            include: {
                discount: true,
            },
        });
        return (vouchers as VoucherResponse[]).filter((voucher) => this.isDiscountAvailable(voucher));
    }

    async deleteVoucher(id: string): Promise<void> {
        // Soft delete both Voucher and Discount in a transaction
        await this.prisma.$transaction(async (tx) => {
            // Get the voucher to find the discount
            const voucher = await tx.voucher.findUniqueOrThrow({
                where: { id },
            });

            // Soft delete the voucher
            await tx.voucher.update({
                where: { id },
                data: { isSoftDeleted: true },
            });

            // Soft delete the discount
            await tx.discount.update({
                where: { id: voucher.discountId },
                data: { isSoftDeleted: true },
            });
        });
    }
}
