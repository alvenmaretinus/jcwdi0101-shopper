import { z } from "zod";

export const CalculateVoucherDiscountSchema = z.object({
    voucherIds: z.array(z.uuid("Invalid voucher ID")).min(1, "At least one voucher ID is required"),
    subtotal: z.number().int().min(0, "Subtotal must be at least 0"),
});

export type CalculateVoucherDiscountInput = z.infer<typeof CalculateVoucherDiscountSchema>;
