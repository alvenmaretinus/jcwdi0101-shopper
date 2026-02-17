import { VoucherCreateReq, VoucherUpdateReq, VoucherResponse, VoucherFilter } from "./entity";
import { VoucherRepo } from "./interface";
import { PrismaClient, Prisma } from "../../../prisma/generated/client";
import { DiscountType, VoucherType } from "../../../prisma/generated/enums";

export class PrismaVoucherRepository implements VoucherRepo {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    async createVoucher(data: VoucherCreateReq): Promise<VoucherResponse> {
        // Create both Discount and Voucher in a transaction
        const result = await this.prisma.$transaction(async (tx) => {
            // First create the discount
            const discount = await tx.discount.create({
                data: {
                    name: data.name,
                    percentage: data.percentage,
                    amount: data.amount,
                    type: data.type as DiscountType,
                    isVoucher: true,
                    isWithMinimum: data.isWithMinimum,
                    minimumPrice: data.minimumPrice,
                    isTiedToProduct: false,
                    startsAt: data.startsAt,
                    endsAt: data.endsAt,
                },
            });

            // Then create the voucher linking to the discount
            const voucher = await tx.voucher.create({
                data: {
                    code: data.code,
                    discountId: discount.id,
                    voucherType: data.voucherType as VoucherType,
                },
                include: {
                    discount: true,
                },
            });

            return voucher;
        });

        return result as VoucherResponse;
    }

    async updateVoucher(id: string, data: Partial<VoucherUpdateReq>): Promise<VoucherResponse> {
        // Update both Discount and Voucher in a transaction
        const result = await this.prisma.$transaction(async (tx) => {
            // Get the voucher to find the discount
            const existingVoucher = await tx.voucher.findUniqueOrThrow({
                where: { id },
                include: { discount: true },
            });

            // Update the discount if discount-related fields are provided
            const discountUpdateData: any = {};
            if (data.name !== undefined) discountUpdateData.name = data.name;
            if (data.percentage !== undefined) discountUpdateData.percentage = data.percentage;
            if (data.amount !== undefined) discountUpdateData.amount = data.amount;
            if (data.type !== undefined) discountUpdateData.type = data.type as DiscountType;
            if (data.isWithMinimum !== undefined) discountUpdateData.isWithMinimum = data.isWithMinimum;
            if (data.minimumPrice !== undefined) discountUpdateData.minimumPrice = data.minimumPrice;
            if (data.startsAt !== undefined) discountUpdateData.startsAt = data.startsAt;
            if (data.endsAt !== undefined) discountUpdateData.endsAt = data.endsAt;

            if (Object.keys(discountUpdateData).length > 0) {
                await tx.discount.update({
                    where: { id: existingVoucher.discountId },
                    data: discountUpdateData,
                });
            }

            // Update the voucher if voucherType or code is provided
            const voucherUpdateData: any = {};
            if (data.voucherType !== undefined) {
                voucherUpdateData.voucherType = data.voucherType as VoucherType;
            }
            if (data.code !== undefined) {
                voucherUpdateData.code = data.code;
            }

            const voucher = await tx.voucher.update({
                where: { id },
                data: voucherUpdateData,
                include: {
                    discount: true,
                },
            });

            return voucher;
        });

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

    /**
     * Format filter to support both regular field filtering AND active date filtering.
     */
    private formatFilter(filter: Partial<VoucherFilter>): Prisma.VoucherWhereInput {
        const { activeOnDate, name, percentage, amount, type, isWithMinimum, minimumPrice, ...voucherFields } = filter;

        const formattedFilter: Prisma.VoucherWhereInput = {
            ...voucherFields,
        };

        // Build discount filters
        const discountFilter: Prisma.DiscountWhereInput = {};
        if (name !== undefined) discountFilter.name = { contains: name, mode: 'insensitive' };
        if (percentage !== undefined) discountFilter.percentage = percentage;
        if (amount !== undefined) discountFilter.amount = amount;
        if (type !== undefined) discountFilter.type = type as DiscountType;
        if (isWithMinimum !== undefined) discountFilter.isWithMinimum = isWithMinimum;
        if (minimumPrice !== undefined) discountFilter.minimumPrice = minimumPrice;
        discountFilter.isVoucher = true;

        if (activeOnDate) {
            const andConditions: Prisma.DiscountWhereInput[] = this.buildActiveDateFilter(activeOnDate);
            discountFilter.AND = andConditions;
        }

        if (Object.keys(discountFilter).length > 0) {
            formattedFilter.discount = discountFilter;
        }

        return formattedFilter;
    }

    async getVouchersByFilter(filter: Partial<VoucherFilter>): Promise<VoucherResponse[]> {
        const formattedFilter: Prisma.VoucherWhereInput = this.formatFilter(filter);
        const vouchers = await this.prisma.voucher.findMany({
            where: formattedFilter,
            include: {
                discount: true,
            },
        });
        return vouchers as VoucherResponse[];
    }

    async getVoucherById(id: string): Promise<VoucherResponse | null> {
        const voucher = await this.prisma.voucher.findUnique({
            where: { id },
            include: {
                discount: true,
            },
        });
        return voucher as VoucherResponse | null;
    }

    async getVoucherByCode(code: string): Promise<VoucherResponse | null> {
        const voucher = await this.prisma.voucher.findUnique({
            where: { code },
            include: {
                discount: true,
            },
        });
        return voucher as VoucherResponse | null;
    }

    async getVouchersByIds(ids: string[]): Promise<VoucherResponse[]> {
        const vouchers = await this.prisma.voucher.findMany({
            where: { 
                id: { in: ids },
            },
            include: {
                discount: true,
            },
        });
        return vouchers as VoucherResponse[];
    }

    async deleteVoucher(id: string): Promise<void> {
        // Delete both Voucher and Discount in a transaction
        await this.prisma.$transaction(async (tx) => {
            // Get the voucher to find the discount
            const voucher = await tx.voucher.findUniqueOrThrow({
                where: { id },
            });

            // Delete the voucher first (foreign key constraint)
            await tx.voucher.delete({
                where: { id },
            });

            // Then delete the discount
            await tx.discount.delete({
                where: { id: voucher.discountId },
            });
        });
    }
}
