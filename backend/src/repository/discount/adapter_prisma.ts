import { DiscountCreateReq, DiscountUpdateReq, DiscountResponse, DiscountFilter } from "./entity";
import { DiscountRepo, PaginationParams, PaginatedResponse } from "./interface";
import { PrismaClient, Prisma } from "../../../prisma/generated/client";
import { DiscountCreateInput } from "../../../prisma/generated/models";
import { DiscountType } from "../../../prisma/generated/enums";
import { calculateStackedDiscount } from "../../lib/discount/calculateStackedDiscount";


export class PrismaRepository implements DiscountRepo {
    private prisma: PrismaClient;

    constructor(prismaClient: PrismaClient) {
        this.prisma = prismaClient;
    }

    private isDiscountAvailable(discount: DiscountResponse): boolean {
        if (!discount.isQuantityLimited) return true;
        if (discount.maxUses === null) return false;
        return discount.useCounter < discount.maxUses;
    }

    async createDiscount(data: DiscountCreateReq): Promise<DiscountResponse> {
        // Check if a soft-deleted discount with the same name exists
        const existingSoftDeleted = await this.prisma.discount.findFirst({
            where: {
                name: data.name,
                isSoftDeleted: true,
            },
        });

        // If soft-deleted discount exists, update and reactivate it
        if (existingSoftDeleted) {
            const updatedDiscount = await this.prisma.discount.update({
                where: { id: existingSoftDeleted.id },
                data: {
                    ...data,
                    type: data.type as DiscountType,
                    isSoftDeleted: false,
                },
            });
            return updatedDiscount as DiscountResponse;
        }

        // Otherwise, create a new discount
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
        const { activeOnDate, name, ...rest } = filter;
        const formattedFilter: Prisma.DiscountWhereInput = { ...rest };

        // Handle case-insensitive name search
        if (name) {
            formattedFilter.name = {
                contains: name,
                mode: 'insensitive' as Prisma.QueryMode,
            };
        }

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
        
        const availableDiscounts = (discounts as DiscountResponse[]).filter((discount) => this.isDiscountAvailable(discount));

        return {
            data: availableDiscounts,
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
        
        const availableDiscounts = (discounts as DiscountResponse[]).filter((discount) => this.isDiscountAvailable(discount));

        const productIds = Array.from(
            new Set(
                availableDiscounts
                    .map((discount) => discount.productId)
                    .filter((productId): productId is string => Boolean(productId))
            )
        );

        if (productIds.length > 0) {
            const activeOnDate = filter.activeOnDate ?? new Date();
            const pricingDiscounts = await this.prisma.discount.findMany({
                where: {
                    isSoftDeleted: false,
                    isTiedToProduct: true,
                    isVoucher: false,
                    productId: { in: productIds },
                    AND: [
                        { OR: this.buildStartsAtCondition(activeOnDate) },
                        { OR: this.buildEndsAtCondition(activeOnDate) },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    percentage: true,
                    amount: true,
                    type: true,
                    isVoucher: true,
                    isWithMinimum: true,
                    minimumPrice: true,
                    hasDiscountAmountCap: true,
                    maxDiscountAmount: true,
                    isQuantityLimited: true,
                    maxUses: true,
                    useCounter: true,
                    isTiedToProduct: true,
                    productId: true,
                    buyQuantity: true,
                    freeQuantity: true,
                    startsAt: true,
                    endsAt: true,
                    isSoftDeleted: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });

            const availablePricingDiscounts = (pricingDiscounts as DiscountResponse[]).filter((discount) =>
                this.isDiscountAvailable(discount)
            );

            const pricingByProductId = new Map<string, DiscountResponse[]>();
            for (const discount of availablePricingDiscounts) {
                if (!discount.productId) continue;
                const existing = pricingByProductId.get(discount.productId) ?? [];
                existing.push(discount);
                pricingByProductId.set(discount.productId, existing);
            }

            for (const discount of availableDiscounts) {
                if (!discount.productId || !discount.product) continue;
                const productDiscounts = pricingByProductId.get(discount.productId) ?? [];
                if (productDiscounts.length === 0) continue;
                discount.product.discountedPricing = calculateStackedDiscount(
                    discount.product.price,
                    productDiscounts
                );
            }
        }

        return {
            data: availableDiscounts,
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
        if (!discount) return null;

        const castedDiscount = discount as DiscountResponse;
        return this.isDiscountAvailable(castedDiscount) ? castedDiscount : null;
    }

    async deleteDiscount(id: string): Promise<void> {
        // Soft delete
        await this.prisma.discount.update({
            where: { id },
            data: { isSoftDeleted: true },
        });
    } 
}
