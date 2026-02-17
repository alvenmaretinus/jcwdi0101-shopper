import { z } from "zod";

// Individual filter fields accept raw query values and are coerced/validated.
const idField = z.preprocess((v) => (typeof v === "string" && v.trim() !== "" ? v : undefined), z.string().uuid("Invalid product ID").optional());
const nameField = z.preprocess((v) => (typeof v === "string" && v.trim() !== "" ? v : undefined), z.string().max(255, "Product name must be at most 255 characters").optional());
const categoryIdField = z.preprocess((v) => (typeof v === "string" && v.trim() !== "" ? v : undefined), z.string().uuid("Invalid category ID").optional());
const storeIdField = z.preprocess((v) => (typeof v === "string" && v.trim() !== "" ? v : undefined), z.string().uuid("Invalid store ID").optional());

export const FilterSchema = z.object({
  id: idField,
  name: nameField,
  categoryId: categoryIdField,
  storeId: storeIdField,
});

export type FilterInput = z.infer<typeof FilterSchema>;

// Accept flat query params (as produced by req.query) and coerce them,
// then transform into the expected { filter, withStock, pagination } shape.
export const GetProductsByFilterSchema = z
  .object({
    id: idField,
    name: nameField,
    categoryId: categoryIdField,
    storeId: storeIdField,
    withStock: z
      .preprocess((v) => {
        if (v === undefined) return false;
        if (typeof v === "boolean") return v;
        const s = String(v).toLowerCase();
        if (s === "true" || s === "1") return true;
        if (s === "false" || s === "0") return false;
        return false;
      }, z.boolean())
      .optional()
      .default(false),
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  })
  .transform((raw) => ({
    filter: {
      id: raw.id,
      name: raw.name,
      categoryId: raw.categoryId,
      storeId: raw.storeId,
    },
    withStock: raw.withStock ?? false,
    pagination: {
      page: raw.page,
      limit: raw.limit,
    },
  }));

export type GetProductsByFilterInput = z.infer<typeof GetProductsByFilterSchema>;