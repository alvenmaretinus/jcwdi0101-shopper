import { z } from "zod";

export const CreateProductCategorySchema = z.strictObject({
  category: z.string().min(1, "Category name is required"),
});
export type CreateProductCategoryInput = z.infer<typeof CreateProductCategorySchema>;