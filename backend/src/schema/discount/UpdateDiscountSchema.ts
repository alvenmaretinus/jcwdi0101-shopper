import {z} from "zod";

export const UpdateDiscountSchema = z.strictObject({
    id : z.uuid("Invalid discount ID"),
    name: z.string().min(1, "Name, if supplied, is required to be at least 1 character").max(255, "Name, if supplied, must be less than 255 characters").optional(),
    percentage: z.union([
        z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid decimal format").transform(val => parseFloat(val)),
        z.number()
    ]).pipe(z.number().min(0).max(100)).optional(),
    amount: z.number().int().min(0, "Amount must be at least 0").optional(),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'QUANTITY']).optional(),
    isVoucher: z.boolean().optional(),
    isWithMinimum: z.boolean().optional(),
    minimumPrice: z.number().int().min(0, "Minimum price must be at least 0").optional(),
    hasDiscountAmountCap: z.boolean().optional(),
    maxDiscountAmount: z.number().int().min(1, "Max discount amount must be at least 1").optional(),
    isQuantityLimited: z.boolean().optional(),
    maxUses: z.number().int().min(1, "Max uses must be at least 1").optional(),
    isTiedToProduct: z.boolean().optional(),
    productId: z.uuid("Invalid product ID").optional().nullable(),
    buyQuantity: z.number().int().min(0, "Buy quantity must be at least 0").optional(),
    freeQuantity: z.number().int().min(0, "Free quantity must be at least 0").optional(),
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
});

export type UpdateDiscountInput = z.infer<typeof UpdateDiscountSchema>;