import { z } from "zod";

export const CalculateVoucherDiscountSchema = z.object({
    voucherCodes: z.array(z.string().min(1, "Invalid voucher code")).min(1, "At least one voucher code is required"),
    subtotal: z.number().int().min(0, "Subtotal must be at least 0"),
});

export type CalculateVoucherDiscountInput = z.infer<typeof CalculateVoucherDiscountSchema>;
