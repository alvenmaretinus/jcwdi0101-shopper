import {z} from "zod";

export const GetProductMovementsByFilterSchema = z.strictObject({
    id: z.uuid("Invalid product movement ID").optional(),
    orderId: z.uuid("Invalid order ID").optional(),
    productId: z.uuid("Invalid product ID").optional(),
    movementType: z.enum(["PURCHASED" , "SOLD" , "REALLOCATED" , "CANCELED" , "ADJUSTMENT"]).optional(),
    fromStoreId: z.uuid("Invalid from store ID").optional(),
    toStoreId: z.uuid("Invalid to store ID").optional(),
});

export type GetProductMovementsByFilterInput = z.infer<typeof GetProductMovementsByFilterSchema>;