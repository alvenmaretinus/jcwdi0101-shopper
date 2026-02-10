import { z } from "zod";

export const CreateProductSchema = z.strictObject({
    name: z.string().min(1, "Product name is required").max(255, "Product name must be at most 255 characters"),
    description: z.string().max(1000, "Description must be at most 1000 characters").optional().nullable(),
    price: z.number().nonnegative("Price must be a non-negative number"),
    categoryId: z.string().min(1, "Category ID is required"), //Intentionally not using UUID to allow for different ID types
    weight: z.number().int().min(1, "Weight must be at least 1"),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;