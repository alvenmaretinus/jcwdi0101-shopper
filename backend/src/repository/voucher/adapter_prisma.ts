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
    if (!voucher.discount.isQuantityLimited) return true;
    if (voucher.discount.maxUses === null) return false;
    return voucher.discount.useCounter < voucher.discount.maxUses;
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
          isQuantityLimited: data.isQuantityLimited,
          maxUses: data.maxUses,
          isTiedToProduct: false,
          buyQuantity: data.buyQuantity,
          freeQuantity: data.freeQuantity,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
        },
      });

      // Then create the voucher linking to the discount
      const voucher = await tx.voucher.create({
        data: {
          code: data.code,
          discountId: discount.id,
          userId: data.userId,
          voucherType: data.voucherType as VoucherType,
          referralRole: data.referralRole as ReferralVoucherRole | undefined,
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
      if (data.isQuantityLimited !== undefined) discountUpdateData.isQuantityLimited = data.isQuantityLimited;
      if (data.maxUses !== undefined) discountUpdateData.maxUses = data.maxUses;
      if (data.buyQuantity !== undefined) discountUpdateData.buyQuantity = data.buyQuantity;
      if (data.freeQuantity !== undefined) discountUpdateData.freeQuantity = data.freeQuantity;
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
      if (data.userId !== undefined) {
        voucherUpdateData.userId = data.userId;
      }
      if (data.referralRole !== undefined) {
        voucherUpdateData.referralRole = data.referralRole as ReferralVoucherRole;
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
   * Special handling:
   * - Vouchers with userId are private and only visible to that user.
   * - Public vouchers (userId null) remain visible to everyone.
   * - Referral vouchers stay private (always tied to userId).
   */
  private formatFilter(filter: Partial<VoucherFilter>, options?: VoucherQueryOptions): Prisma.VoucherWhereInput {
    const { activeOnDate, name, percentage, amount, type, isWithMinimum, minimumPrice, userId, ...voucherFields } = filter;
    const includeAllReferral = options?.includeAllReferral === true;

    const formattedFilter: Prisma.VoucherWhereInput = {
      ...voucherFields,
    };

    // Filter user-assigned vouchers to only show to their designated user.
    // Public vouchers are userId=null.
    if (!includeAllReferral) {
      if (userId) {
        formattedFilter.OR = [
          // Public non-referral vouchers visible to everyone
          { userId: null, voucherType: { not: "REFERRAL" } },
          // All private vouchers for current user (including referral/reward vouchers)
          {
            userId: userId,
          },
        ];
      } else {
        // Unauthenticated users can only see public non-referral vouchers
        formattedFilter.userId = null;
        formattedFilter.voucherType = { not: "REFERRAL" };
      }
    }

    // Build discount filters
    const discountFilter: Prisma.DiscountWhereInput = {};
    if (name !== undefined) discountFilter.name = { contains: name, mode: "insensitive" };
    if (percentage !== undefined) discountFilter.percentage = percentage;
    if (amount !== undefined) discountFilter.amount = amount;
    if (type !== undefined) discountFilter.type = type as DiscountType;
    if (isWithMinimum !== undefined) discountFilter.isWithMinimum = isWithMinimum;
    if (minimumPrice !== undefined) discountFilter.minimumPrice = minimumPrice;
    discountFilter.isVoucher = true;
    discountFilter.isSoftDeleted = false;

    if (activeOnDate) {
      const andConditions: Prisma.DiscountWhereInput[] = this.buildActiveDateFilter(activeOnDate);
      discountFilter.AND = andConditions;
    }

    if (Object.keys(discountFilter).length > 0) {
      formattedFilter.discount = discountFilter;
    }

    return formattedFilter;
  }

  async getVouchersByFilter(filter: Partial<VoucherFilter>, pagination?: PaginationParams, options?: VoucherQueryOptions): Promise<PaginatedResponse<VoucherResponse>> {
    const formattedFilter: Prisma.VoucherWhereInput = this.formatFilter(filter, options);
    formattedFilter.isSoftDeleted = false;
    formattedFilter.discount = {
      ...((formattedFilter.discount as any) || {}),
      isSoftDeleted: false,
    };

    // If pagination is provided, use it; otherwise default to page 1, limit 20
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;
    const skip = (page - 1) * limit;

    const [vouchers, total] = await Promise.all([
      this.prisma.voucher.findMany({
        where: formattedFilter,
        include: {
          discount: true,
        },
        skip,
        take: limit,
      }),
      this.prisma.voucher.count({
        where: formattedFilter,
      }),
    ]);

    const availableVouchers = (vouchers as VoucherResponse[]).filter((voucher) => this.isDiscountAvailable(voucher));

    return {
      data: availableVouchers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getVoucherById(id: string): Promise<VoucherResponse | null> {
    const voucher = await this.prisma.voucher.findFirst({
      where: {
        id,
        isSoftDeleted: false,
        discount: {
          isSoftDeleted: false,
        },
      },
      include: {
        discount: true,
      },
    });
    if (!voucher) return null;
    const castedVoucher = voucher as VoucherResponse;
    return this.isDiscountAvailable(castedVoucher) ? castedVoucher : null;
  }

  async getVoucherByCode(code: string): Promise<VoucherResponse | null> {
    const voucher = await this.prisma.voucher.findFirst({
      where: {
        code: { equals: code, mode: "insensitive" },
        isSoftDeleted: false,
        discount: {
          isSoftDeleted: false,
        },
      },
      include: {
        discount: true,
      },
    });
    if (!voucher) return null;
    const castedVoucher = voucher as VoucherResponse;
    return this.isDiscountAvailable(castedVoucher) ? castedVoucher : null;
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
    const normalizedCodes = codes.map((code) => code.trim()).filter((code) => code.length > 0);

    if (normalizedCodes.length === 0) {
      return [];
    }

    const vouchers = await this.prisma.voucher.findMany({
      where: {
        OR: normalizedCodes.map((code) => ({
          code: { equals: code, mode: "insensitive" },
        })),
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
