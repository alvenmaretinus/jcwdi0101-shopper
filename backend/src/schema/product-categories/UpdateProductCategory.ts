import { z } from "zod";
export const UpdateProductCategorySchema = z.strictObject({
    id: z.uuid("Invalid product category ID"),
    name: z.string().min(1, "Category name is required"), //Required since it is the only variable updated
});

export type UpdateProductCategoryInput = z.infer<typeof UpdateProductCategorySchema>;