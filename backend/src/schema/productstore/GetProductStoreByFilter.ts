import {z} from "zod";


export const GetProductStoresByFilterSchema = z.strictObject({
    id: z.uuid("Invalid product store ID").optional(),
    productId: z.uuid("Invalid product ID").optional(),
    storeId: z.uuid("Invalid store ID").optional(),
});

export type GetProductStoresByFilterInput = z.infer<typeof GetProductStoresByFilterSchema>;