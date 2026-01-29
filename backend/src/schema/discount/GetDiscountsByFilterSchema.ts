import { z } from "zod";

export const GetDiscountsByFilterSchema = z.strictObject({
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT', 'QUANTITY']).optional(),
    isWithMinimum: z.boolean().optional(),
    isTiedToProduct: z.boolean().optional(),
    activeOnDate: z.date().optional(),
});

export type GetDiscountsByFilterInput = z.infer<typeof GetDiscountsByFilterSchema>;


