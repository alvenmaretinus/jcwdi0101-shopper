import { z } from "zod"; 

export const UpdateProductSchema = z.strictObject({
    id: z.uuid("Invalid product ID"),
    name: z.string().max(255, "Product name must be at most 255 characters").optional(),
    description: z.string().max(1000, "Description must be at most 1000 characters").optional(),
    price: z.number().nonnegative("Price must be a non-negative number").optional(),
    categoryId: z.uuid("Invalid category ID").optional(),
});

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;