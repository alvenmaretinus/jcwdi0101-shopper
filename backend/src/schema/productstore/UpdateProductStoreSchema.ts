import {z} from "zod";

export const UpdateProductStoreSchema = z.strictObject({
    id: z.uuid("Invalid product store ID"),
    productId: z.uuid("Invalid product ID").optional(),
    storeId: z.uuid("Invalid store ID").optional(),
    quantity: z.number().int("Quantity must be an integer").min(0, "Quantity cannot be negative").optional()

});
export type UpdateProductStoreInput = z.infer<typeof UpdateProductStoreSchema>;