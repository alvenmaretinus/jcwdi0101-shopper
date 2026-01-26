import {z} from "zod";


export const GetProductStoresByFilterSchema = z.strictObject({
    id: z.string().uuid("Invalid product store ID").optional(),
    productId: z.string().uuid("Invalid product ID").optional(),
    storeId: z.string().uuid("Invalid store ID").optional(),
});

export type GetProductStoresByFilterInput = z.infer<typeof GetProductStoresByFilterSchema>;