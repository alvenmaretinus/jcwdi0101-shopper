import {z} from "zod";

export const CreateProductMovementSchema = z.strictObject({
    orderId: z.uuid("Invalid order ID").nullable().optional(),
    quantityChange: z.number().int("Quantity change must be an integer"),
    productName: z.string().max(255, "Product name must be at most 255 characters"),
    productCategory: z.string().max(255, "Product category must be at most 255 characters"),
    movementType: z.enum(["PURCHASED" , "SOLD" , "REALLOCATED" , "CANCELED" , "ADJUSTMENT"]),
    description: z.string().max(500, "Description must be at most 500 characters").nullable().optional(),
    fromStoreId: z.uuid().nullable().optional(),
    toStoreId: z.uuid().nullable().optional(),
    productId: z.uuid("Invalid product ID"),
});

export type CreateProductMovementInput = z.infer<typeof CreateProductMovementSchema>;