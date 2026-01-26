import {z} from "zod";
export const UpdateProductCategorySchema = z.strictObject({
    id: z.uuid("Invalid product category ID"),
    category: z.string().min(1, "Category name is required"),
});
export type UpdateProductCategoryInput = z.infer<typeof UpdateProductCategorySchema>;