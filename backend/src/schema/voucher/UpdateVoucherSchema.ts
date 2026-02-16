import { z } from "zod";

export const UpdateVoucherSchema = z.strictObject({
    id: z.uuid("Invalid voucher ID"),
    name: z.string().min(1, "Name is required").optional(),
    percentage: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid decimal format").transform(val => parseFloat(val)).pipe(z.number().min(0).max(100)).optional(),
    amount: z.number().int().min(0, "Amount must be at least 0").optional(),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).optional(),
    voucherType: z.enum(['REFERRAL', 'TRANSACTIONAL', 'FREEDELIVERY']).optional(),
    isWithMinimum: z.boolean().optional(),
    minimumPrice: z.number().int().min(0, "Minimum price must be at least 0").optional(),
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
});

export type UpdateVoucherInput = z.infer<typeof UpdateVoucherSchema>;
