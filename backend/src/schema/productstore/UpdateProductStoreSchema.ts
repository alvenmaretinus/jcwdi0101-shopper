import {z} from "zod";

export const UpdateProductStoreSchema = z.strictObject({
    id: z.string().uuid("Invalid product store ID"),
    productId: z.string().uuid("Invalid product ID").optional(),
    storeId: z.string().uuid("Invalid store ID").optional(),
});
export type UpdateProductStoreInput = z.infer<typeof UpdateProductStoreSchema>;