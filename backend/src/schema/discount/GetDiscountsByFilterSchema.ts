import { z } from "zod";

/**
 * Business requirement: API for filtering discounts with multiple criteria.
 * 
 * Supports:
 * - Field-based filters: percentage, amount, type, productId, etc.
 * - Active date filter: Returns only discounts valid on the specified date
 * - Pagination: page and limit for paginated results
 * 
 * When activeOnDate is provided, the system filters discounts where:
 * - startsAt is NULL OR startsAt <= activeOnDate
 * - AND endsAt is NULL OR endsAt >= activeOnDate
 */
export const GetDiscountsByFilterSchema = z.strictObject({
    name: z.string().min(1).optional(),
    percentage: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid decimal format").transform(val => parseFloat(val)).pipe(z.number().min(0).max(100)).optional(),
    amount: z.coerce.number().int().min(0).optional(),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'QUANTITY']).optional(),
    isWithMinimum: z.string().transform(val => val === '' ? undefined : val === 'true').pipe(z.boolean()).optional(),
    minimumPrice: z.coerce.number().int().min(0).optional(),
    hasDiscountAmountCap: z.string().transform(val => val === '' ? undefined : val === 'true').pipe(z.boolean()).optional(),
    maxDiscountAmount: z.coerce.number().int().min(1).optional(),
    isQuantityLimited: z.string().transform(val => val === '' ? undefined : val === 'true').pipe(z.boolean()).optional(),
    maxUses: z.coerce.number().int().min(1).optional(),
    useCounter: z.coerce.number().int().min(0).optional(),
    isTiedToProduct: z.string().transform(val => val === '' ? undefined : val === 'true').pipe(z.boolean()).optional(),
    productId: z.uuid("Invalid product ID").optional(),
    buyQuantity: z.coerce.number().int().min(0).optional(),
    freeQuantity: z.coerce.number().int().min(0).optional(),
    isSoftDeleted: z.string().transform(val => val === '' ? undefined : val === 'true').pipe(z.boolean()).optional(),
    /** Filter discounts that are active/valid on this specific date */
    activeOnDate: z.coerce.date().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type GetDiscountsByFilterInput = z.infer<typeof GetDiscountsByFilterSchema>;


