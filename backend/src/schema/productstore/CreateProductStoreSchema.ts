import { z } from "zod";

export const CreateProductStoreSchema = z.strictObject({
    quantity: z.number().int("Quantity must be an integer").min(0, "Quantity cannot be negative"),
    productId: z.string().uuid("Invalid product ID"),
    storeId: z.string().uuid("Invalid store ID")
})

export type CreateProductStoreInput = z.infer<typeof CreateProductStoreSchema>;