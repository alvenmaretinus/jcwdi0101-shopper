import { DiscountCreateReq, DiscountUpdateReq, DiscountResponse, DiscountFilter } from "./entity";
import { DiscountRepo } from "./interface";
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
        const discount: DiscountResponse = await this.prisma.discount.create(
            { data: discountCreateData }
        );
        return discount;
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
     * Build OR condition for startsAt (null or <= activeOnDate)
     */
    private buildStartsAtCondition(activeOnDate: Date): Prisma.DiscountWhereInput[] {
        const startsAtIsNull: Prisma.DiscountWhereInput = { startsAt: null };
        const startsAtLte: Prisma.DiscountWhereInput = { startsAt: { lte: activeOnDate } };
        return [startsAtIsNull, startsAtLte];
    }

    /**
     * Build OR condition for endsAt (null or >= activeOnDate)
     */
    private buildEndsAtCondition(activeOnDate: Date): Prisma.DiscountWhereInput[] {
        const endsAtIsNull: Prisma.DiscountWhereInput = { endsAt: null };
        const endsAtGte: Prisma.DiscountWhereInput = { endsAt: { gte: activeOnDate } };
        return [endsAtIsNull, endsAtGte];
    }

    /**
     * Build complete date range filter with explicit AND/OR structure
     */
    private buildActiveDateFilter(activeOnDate: Date): Prisma.DiscountWhereInput[] {
        const startsAtOrConditions: Prisma.DiscountWhereInput[] = this.buildStartsAtCondition(activeOnDate);
        const endsAtOrConditions: Prisma.DiscountWhereInput[] = this.buildEndsAtCondition(activeOnDate);

        const startsAtCondition: Prisma.DiscountWhereInput = { OR: startsAtOrConditions };
        const endsAtCondition: Prisma.DiscountWhereInput = { OR: endsAtOrConditions };

        return [startsAtCondition, endsAtCondition];
    }

    /**
     * Format filter with active date conditions if provided
     *
     * - Preserves explicit startsAt/endsAt filters passed by callers.
     * - Handles activeOnDate separately, without overloading startsAt.
     */
    private formatFilter(filter: Partial<DiscountFilter>): Prisma.DiscountWhereInput {
        // Destructure known date-related fields while keeping the rest of the filters intact
        const { startsAt, endsAt, activeOnDate, ...rest } = filter as any;
        const formattedFilter: Prisma.DiscountWhereInput = { ...rest };

        // Preserve explicit startsAt/endsAt filters provided by the caller
        if (startsAt !== undefined) {
            (formattedFilter as any).startsAt = startsAt;
        }
        if (endsAt !== undefined) {
            (formattedFilter as any).endsAt = endsAt;
        }

        // Determine the effective "active on date" value:
        // 1. Prefer explicit activeOnDate if present.
        // 2. Fallback: for backwards compatibility, treat startsAt.lte as activeOnDate.
        let effectiveActiveOnDate: Date | undefined;

        if (activeOnDate instanceof Date) {
            effectiveActiveOnDate = activeOnDate;
        } else if (
            startsAt &&
            typeof startsAt === "object" &&
            "lte" in startsAt &&
            (startsAt as any).lte instanceof Date
        ) {
            effectiveActiveOnDate = (startsAt as any).lte as Date;
        }

        if (effectiveActiveOnDate) {
            const andConditions: Prisma.DiscountWhereInput[] =
                this.buildActiveDateFilter(effectiveActiveOnDate);

            // Merge with any existing AND conditions on the filter
            if ((formattedFilter as any).AND) {
                const existingAnd = (formattedFilter as any).AND;
                if (Array.isArray(existingAnd)) {
                    (formattedFilter as any).AND = [...existingAnd, ...andConditions];
                } else {
                    (formattedFilter as any).AND = [existingAnd, ...andConditions];
                }
            } else {
                (formattedFilter as any).AND = andConditions;
            }
        }
        return formattedFilter;
    }
 
    async getDiscountsByFilter(filter: Partial<DiscountFilter>): Promise<DiscountResponse[]> {
        const formattedFilter: Prisma.DiscountWhereInput = this.formatFilter(filter);
        const discounts = await this.prisma.discount.findMany({
            where: formattedFilter,
        });
        return discounts as DiscountResponse[];
    }
    
    async getDiscountById(id: string): Promise<DiscountResponse | null> {
        const discount = await this.prisma.discount.findUnique({
            where: { id },
        });
        return discount as DiscountResponse | null;
    }

    async deleteDiscount(id: string): Promise<void> {
        await this.prisma.discount.delete({
            where: { id },
        });
    } 
}
