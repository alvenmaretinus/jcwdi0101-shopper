import { z } from "zod";

export const CreateProductStoreSchema = z.strictObject({
    // NOTE: quantity: 0 is intentionally allowed here to support reserving
    // product–store relationships before actual stock arrives.
    quantity: z.number().int("Quantity must be an integer").min(0, "Quantity cannot be negative"),
    productId: z.uuid("Invalid product ID"),
    storeId: z.uuid("Invalid store ID")
})

export type CreateProductStoreInput = z.infer<typeof CreateProductStoreSchema>;