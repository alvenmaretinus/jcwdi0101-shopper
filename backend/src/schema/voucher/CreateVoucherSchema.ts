import { z } from "zod";

export const CreateVoucherSchema = z.strictObject({
    name: z.string().min(1, "Name is required"),
    percentage: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid decimal format").transform(val => parseFloat(val)).pipe(z.number().min(0).max(100)).optional(),
    amount: z.number().int().min(0, "Amount must be at least 0").optional(),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
    voucherType: z.enum(['REFERRAL', 'TRANSACTIONAL', 'FREEDELIVERY']),
    isWithMinimum: z.boolean().default(false),
    minimumPrice: z.number().int().min(0, "Minimum price must be at least 0").optional(),
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
});

export type CreateVoucherInput = z.infer<typeof CreateVoucherSchema>;
