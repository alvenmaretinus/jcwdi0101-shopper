import {z} from "zod";

export const UpdateProductStoreSchema = z.strictObject({
    id: z.uuid("Invalid product store ID"),
    quantity: z.number().int("Quantity must be an integer").min(0, "Quantity cannot be negative")
});

export type UpdateProductStoreInput = z.infer<typeof UpdateProductStoreSchema>;