import { DiscountCreateReq, DiscountUpdateReq, DiscountResponse, DiscountFilter } from "./entity";
import { DiscountRepo, PaginationParams, PaginatedResponse } from "./interface";
import { PrismaClient, Prisma } from "../../../prisma/generated/client";
import { DiscountCreateInput } from "../../../prisma/generated/models";
import { DiscountType } from "../../../prisma/generated/enums";


export class PrismaRepository implements DiscountRepo {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    async createDiscount(data: DiscountCreateReq): Promise<DiscountResponse> {
        const discountCreateData: DiscountCreateInput = {
            ...data,
            type: data.type as DiscountType,
        }
        const discount = await this.prisma.discount.create(
            { data: discountCreateData }
        );
        return discount as DiscountResponse;
    }
    
    async updateDiscount(id: string, data: Partial<DiscountUpdateReq>): Promise<DiscountResponse> {
         const updateData = {
            ...data,
            ...(data.type !== undefined ? { type: data.type as DiscountType } : {}),
        };
        const discount = await this.prisma.discount.update({
            where: { id },
            data: updateData,
        });
        return discount as DiscountResponse;
    }

    /**
     * Business requirement: Build OR condition for startsAt date filtering.
     * A discount is active if:
     * - startsAt is NULL (no start date restriction), OR
     * - startsAt <= activeOnDate (discount has already started)
     */
    private buildStartsAtCondition(activeOnDate: Date): Prisma.DiscountWhereInput[] {
        const startsAtIsNull: Prisma.DiscountWhereInput = { startsAt: null };
        const startsAtLte: Prisma.DiscountWhereInput = { startsAt: { lte: activeOnDate } };
        return [startsAtIsNull, startsAtLte];
    }

    /**
     * Business requirement: Build OR condition for endsAt date filtering.
     * A discount is active if:
     * - endsAt is NULL (no end date restriction), OR
     * - endsAt >= activeOnDate (discount has not yet ended)
     */
    private buildEndsAtCondition(activeOnDate: Date): Prisma.DiscountWhereInput[] {
        const endsAtIsNull: Prisma.DiscountWhereInput = { endsAt: null };
        const endsAtGte: Prisma.DiscountWhereInput = { endsAt: { gte: activeOnDate } };
        return [endsAtIsNull, endsAtGte];
    }

    /**
     * Business requirement: Build complete date range filter for active discounts.
     * Combines startsAt and endsAt conditions with AND logic.
     * This ensures only discounts valid on the specified date are returned.
     */
    private buildActiveDateFilter(activeOnDate: Date): Prisma.DiscountWhereInput[] {
        const startsAtOrConditions: Prisma.DiscountWhereInput[] = this.buildStartsAtCondition(activeOnDate);
        const endsAtOrConditions: Prisma.DiscountWhereInput[] = this.buildEndsAtCondition(activeOnDate);

        const startsAtCondition: Prisma.DiscountWhereInput = { OR: startsAtOrConditions };
        const endsAtCondition: Prisma.DiscountWhereInput = { OR: endsAtOrConditions };

        return [startsAtCondition, endsAtCondition];
    }

    /**
     * Business requirement: Format filter to support both regular field filtering AND active date filtering.
     * 
     * Regular filters (percentage, amount, type, etc.) are applied directly.
     * 
     * Active date filtering: When activeOnDate is provided,
     * the system returns only discounts that are valid on that specific date:
     * - startsAt IS NULL OR startsAt <= activeOnDate
     * - AND endsAt IS NULL OR endsAt >= activeOnDate
     */
    private formatFilter(filter: Partial<DiscountFilter>): Prisma.DiscountWhereInput {
        const { activeOnDate, ...rest } = filter;
        const formattedFilter: Prisma.DiscountWhereInput = { ...rest };

        if (activeOnDate) {
            const andConditions: Prisma.DiscountWhereInput[] = this.buildActiveDateFilter(activeOnDate);
            formattedFilter.AND = andConditions;
        }

        return formattedFilter;
    }
 
    /**
     * Business requirement: Get discounts with flexible filtering options.
     * 
     * Supports:
     * - Regular field filters: percentage, amount, type, productId, etc.
     * - Active date filtering: Returns only discounts valid on a specific date
     * - Pagination: Returns paginated results with metadata
     * 
     * Complex date range logic is handled by formatFilter() method.
     */
    async getDiscountsByFilter(filter: Partial<DiscountFilter>, pagination?: PaginationParams): Promise<PaginatedResponse<DiscountResponse>> {
        const formattedFilter: Prisma.DiscountWhereInput = this.formatFilter(filter);
        formattedFilter.isSoftDeleted = false;
        
        // If pagination is provided, use it; otherwise default to page 1, limit 20
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 20;
        const skip = (page - 1) * limit;
        
        const [discounts, total] = await Promise.all([
            this.prisma.discount.findMany({
                where: formattedFilter,
                skip,
                take: limit,
                include: {
                    product: {
                        include: {
                            productImages: true,
                            category: true,
                            productStores: {
                                include: {
                                    store: {
                                        select: {
                                            id: true,
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.discount.count({
                where: formattedFilter,
            }),
        ]);
        
        return {
            data: discounts as DiscountResponse[],
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    
    async getProductsWithDiscounts(filter: Partial<DiscountFilter>, pagination?: PaginationParams): Promise<PaginatedResponse<DiscountResponse>> {
        const formattedFilter: Prisma.DiscountWhereInput = this.formatFilter(filter);
        formattedFilter.isSoftDeleted = false;
        formattedFilter.isTiedToProduct = true;
        formattedFilter.productId = { not: null };
        
        // If pagination is provided, use it; otherwise default to page 1, limit 20
        const page = pagination?.page ?? 1;
        const limit = pagination?.limit ?? 20;
        const skip = (page - 1) * limit;
        
        const [discounts, total] = await Promise.all([
            this.prisma.discount.findMany({
                where: formattedFilter,
                skip,
                take: limit,
                include: {
                    product: {
                        include: {
                            productImages: true,
                            category: true,
                            productStores: {
                                include: {
                                    store: {
                                        select: {
                                            id: true,
                                            name: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }),
            this.prisma.discount.count({
                where: formattedFilter,
            }),
        ]);
        
        return {
            data: discounts as DiscountResponse[],
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    
    async getDiscountById(id: string): Promise<DiscountResponse | null> {
        const discount = await this.prisma.discount.findFirst({
            where: { 
                id,
                isSoftDeleted: false,
            },
            include: {
                product: {
                    include: {
                        productImages: true,
                        category: true,
                        productStores: {
                            include: {
                                store: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        return discount as DiscountResponse | null;
    }

    async deleteDiscount(id: string): Promise<void> {
        // Soft delete
        await this.prisma.discount.update({
            where: { id },
            data: { isSoftDeleted: true },
        });
    } 
}
