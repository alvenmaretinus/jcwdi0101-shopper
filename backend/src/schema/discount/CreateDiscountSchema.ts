import { z } from "zod";    

export const CreateDiscountSchema = z.strictObject({
    percentage: z.string().optional(),
    amount: z.number().min(0, "Amount must be at least 0").optional(),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'QUANTITY']),
    isWithMinimum: z.boolean(),
    minimumPrice: z.number().min(0, "Minimum price must be at least 0").optional(),
    isTiedToProduct: z.boolean(),
    productId: z.string().uuid("Invalid product ID").optional(),
    buyQuantity: z.number().int().min(0, "Buy quantity must be at least 0").optional(),
    freeQuantity: z.number().int().min(0, "Free quantity must be at least 0").optional(),
    startsAt: z.date().optional(),
    endsAt: z.date().optional(),
});


export type CreateDiscountInput = z.infer<typeof CreateDiscountSchema>;
