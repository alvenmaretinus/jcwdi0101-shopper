import { z } from "zod";    

export const CreateDiscountSchema = z.strictObject({
    name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
    percentage: z.union([
        z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid decimal format").transform(val => parseFloat(val)),
        z.number()
    ]).pipe(z.number().min(0).max(100)).optional(),
    amount: z.number().int().min(0, "Amount must be at least 0").optional(),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'QUANTITY']),
    isVoucher: z.boolean().default(false).optional(),
    isWithMinimum: z.boolean(),
    minimumPrice: z.number().int().min(0, "Minimum price must be at least 0").optional(),
    hasDiscountAmountCap: z.boolean().optional().default(false),
    maxDiscountAmount: z.number().int().min(1, "Max discount amount must be at least 1").optional(),
    isQuantityLimited: z.boolean().optional().default(false),
    maxUses: z.number().int().min(1, "Max uses must be at least 1").optional(),
    isTiedToProduct: z.boolean(),
    productId: z.uuid("Invalid product ID").optional().nullable(),
    buyQuantity: z.number().int().min(0, "Buy quantity must be at least 0").optional(),
    freeQuantity: z.number().int().min(0, "Free quantity must be at least 0").optional(),
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
});


export type CreateDiscountInput = z.infer<typeof CreateDiscountSchema>;
