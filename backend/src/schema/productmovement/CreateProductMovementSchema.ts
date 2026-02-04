import {z} from "zod";

export const CreateProductMovementSchema = z.strictObject({
    orderId: z.uuid("Invalid order ID").nullable().optional(),
    quantityChange: z.number().int("Quantity change must be an integer"),
    movementType: z.enum(["PURCHASED" , "SOLD" , "REALLOCATED" , "CANCELED" , "ADJUSTMENT"]),
    description: z.string().max(500, "Description must be at most 500 characters").nullable().optional(),
    fromStoreId: z.uuid("Invalid from store ID").nullable().optional(),
    toStoreId: z.uuid("Invalid to store ID").nullable().optional(),
    productId: z.uuid("Invalid product ID"),
});

export type CreateProductMovementInput = z.infer<typeof CreateProductMovementSchema>;