import { z } from "zod";
import { PRODUCT_ALLOWED_SORTS, PRODUCT_QUERY_DEFAULTS } from "../../constants/product-query";

// Individual filter fields accept raw query values and are coerced/validated.
const idField = z.preprocess((v) => (typeof v === "string" && v.trim() !== "" ? v : undefined), z.string().uuid("Invalid product ID").optional());
const nameField = z.preprocess((v) => (typeof v === "string" && v.trim() !== "" ? v : undefined), z.string().max(255, "Product name must be at most 255 characters").optional());
const categoryIdField = z.preprocess((v) => (typeof v === "string" && v.trim() !== "" ? v : undefined), z.string().uuid("Invalid category ID").optional());
const storeIdField = z.preprocess((v) => (typeof v === "string" && v.trim() !== "" ? v : undefined), z.string().uuid("Invalid store ID").optional());
const sortField = z
  .enum(PRODUCT_ALLOWED_SORTS)
  .optional()
  .default(PRODUCT_QUERY_DEFAULTS.sort);

const inStockOnlyField = z.preprocess((v) => {
  if (v === undefined) return PRODUCT_QUERY_DEFAULTS.inStockOnly;
  if (typeof v === "boolean") return v;
  const s = String(v).toLowerCase();
  if (s === "true" || s === "1") return true;
  if (s === "false" || s === "0") return false;
  return PRODUCT_QUERY_DEFAULTS.inStockOnly;
}, z.boolean()).optional().default(PRODUCT_QUERY_DEFAULTS.inStockOnly);

export const FilterSchema = z.object({
  id: idField,
  name: nameField,
  categoryId: categoryIdField,
  storeId: storeIdField,
  inStockOnly: inStockOnlyField,
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
    inStockOnly: inStockOnlyField,
    withStock: z
      .preprocess((v) => {
        if (v === undefined) return PRODUCT_QUERY_DEFAULTS.withStock;
        if (typeof v === "boolean") return v;
        const s = String(v).toLowerCase();
        if (s === "true" || s === "1") return true;
        if (s === "false" || s === "0") return false;
        return PRODUCT_QUERY_DEFAULTS.withStock;
      }, z.boolean())
      .optional()
      .default(PRODUCT_QUERY_DEFAULTS.withStock),
    withDiscounts: z
      .preprocess((v) => {
        if (v === undefined) return PRODUCT_QUERY_DEFAULTS.withDiscounts;
        if (typeof v === "boolean") return v;
        const s = String(v).toLowerCase();
        if (s === "true" || s === "1") return true;
        if (s === "false" || s === "0") return false;
        return PRODUCT_QUERY_DEFAULTS.withDiscounts;
      }, z.boolean())
      .optional()
      .default(PRODUCT_QUERY_DEFAULTS.withDiscounts),
    sort: sortField,
    page: z.coerce.number().int().min(1).optional().default(PRODUCT_QUERY_DEFAULTS.page),
    limit: z.coerce.number().int().min(1).max(100).optional().default(PRODUCT_QUERY_DEFAULTS.limit),
  })
  .transform((raw) => ({
    filter: {
      id: raw.id,
      name: raw.name,
      categoryId: raw.categoryId,
      storeId: raw.storeId,
      inStockOnly: raw.inStockOnly ?? PRODUCT_QUERY_DEFAULTS.inStockOnly,
    },
    withStock: raw.withStock ?? PRODUCT_QUERY_DEFAULTS.withStock,
    withDiscounts: raw.withDiscounts ?? PRODUCT_QUERY_DEFAULTS.withDiscounts,
    pagination: {
      page: raw.page,
      limit: raw.limit,
      sort: raw.sort,
    },
  }));

export type GetProductsByFilterInput = z.infer<typeof GetProductsByFilterSchema>;