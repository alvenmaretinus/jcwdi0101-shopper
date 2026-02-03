import {z} from "zod";

export const UpdateDiscountSchema = z.strictObject({
    id : z.uuid("Invalid discount ID"),
    percentage: z.coerce.number().min(0, "Percentage must be at least 0").max(100, "Percentage cannot exceed 100").optional(),
    amount: z.number().int().min(0, "Amount must be at least 0").optional(),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'QUANTITY']).optional(),
    isWithMinimum: z.boolean().optional(),
    minimumPrice: z.number().int().min(0, "Minimum price must be at least 0").optional(),
    isTiedToProduct: z.boolean().optional(),
    productId: z.uuid("Invalid product ID").optional(),
    buyQuantity: z.number().int().min(0, "Buy quantity must be at least 0").optional(),
    freeQuantity: z.number().int().min(0, "Free quantity must be at least 0").optional(),
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
});

export type UpdateDiscountInput = z.infer<typeof UpdateDiscountSchema>;