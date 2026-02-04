import { z } from "zod";

/**
 * Business requirement: API for filtering discounts with multiple criteria.
 * 
 * Supports:
 * - Field-based filters: percentage, amount, type, productId, etc.
 * - Active date filter: Returns only discounts valid on the specified date
 * 
 * When activeOnDate is provided, the system filters discounts where:
 * - startsAt is NULL OR startsAt <= activeOnDate
 * - AND endsAt is NULL OR endsAt >= activeOnDate
 */
export const GetDiscountsByFilterSchema = z.strictObject({
    percentage: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid decimal format").transform(val => parseFloat(val)).pipe(z.number().min(0).max(100)).optional(),
    amount: z.coerce.number().min(0).optional(),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'QUANTITY']).optional(),
    isWithMinimum: z.boolean().optional(),
    minimumPrice: z.number().optional(),
    isTiedToProduct: z.boolean().optional(),
    productId: z.uuid("Invalid product ID").optional(),
    buyQuantity: z.coerce.number().int().min(1).optional(),
    freeQuantity: z.coerce.number().int().min(1).optional(),
    /** Filter discounts that are active/valid on this specific date */
    activeOnDate: z.coerce.date().optional(),
});

export type GetDiscountsByFilterInput = z.infer<typeof GetDiscountsByFilterSchema>;


