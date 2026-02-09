import {z} from "zod";

export const UpdateDiscountSchema = z.strictObject({
    id : z.uuid("Invalid discount ID"),
    name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters").optional(),
    percentage: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid decimal format").transform(val => parseFloat(val)).pipe(z.number().min(0).max(100)).optional(),
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