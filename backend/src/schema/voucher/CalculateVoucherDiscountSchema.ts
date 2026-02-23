import { z } from "zod";

export const CalculateVoucherDiscountSchema = z.object({
    voucherCodes: z.array(z.string().min(1, "Invalid voucher code")).min(1, "At least one voucher code is required"),
    subtotal: z.number().int().min(0, "Subtotal must be at least 0"),
    shippingCost: z.number().int().min(0, "Shipping cost must be at least 0").optional(),
    cartItems: z.array(
        z.object({
            productId: z.string().min(1, "Invalid product ID"),
            quantity: z.number().int().min(1, "Quantity must be at least 1"),
            unitPrice: z.number().int().min(0, "Unit price must be at least 0"),
        })
    ).optional(),
});

export type CalculateVoucherDiscountInput = z.infer<typeof CalculateVoucherDiscountSchema>;
