import {z} from "zod";

const FilterSchema = z.strictObject({
  id: z.uuid("Invalid product ID").optional(),
  name: z.string().max(255, "Product name must be at most 255 characters").optional(),
  categoryId: z.uuid("Invalid category ID").optional(),
  storeId: z.uuid("Invalid store ID").optional(),
});

export type FilterInput = z.infer<typeof FilterSchema>;

export const GetProductsByFilterSchema = z.strictObject({
  filter: FilterSchema,
  withStock: z.boolean().optional().default(false),
});

export type GetProductsByFilterInput = z.infer<typeof GetProductsByFilterSchema>;