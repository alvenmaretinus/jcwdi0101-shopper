import { z } from "zod";

export const GetVouchersByFilterSchema = z.object({
    name: z.string().optional(),
    percentage: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid decimal format").transform(val => parseFloat(val)).pipe(z.number().min(0).max(100)).optional(),
    amount: z.string().transform(val => parseInt(val, 10)).pipe(z.number().int().min(0)).optional(),
    type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']).optional(),
    voucherType: z.enum(['REFERRAL', 'TRANSACTIONAL', 'FREEDELIVERY']).optional(),
    isRedeemed: z.string().transform(val => val === 'true').pipe(z.boolean()).optional(),
    activeOnDate: z.coerce.date().optional(),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type GetVouchersByFilterInput = z.infer<typeof GetVouchersByFilterSchema>;
