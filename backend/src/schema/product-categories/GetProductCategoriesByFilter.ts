import { z } from "zod";
import { PRODUCT_CATEGORY_QUERY_DEFAULTS } from "../../constants/product-query";

const idField = z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? v : undefined),
    z.uuid("Invalid category ID").optional(),
);

const nameField = z.preprocess(
    (v) => (typeof v === "string" && v.trim() !== "" ? v : undefined),
    z.string().max(255, "Category must be at most 255 characters").optional(),
);

export const GetProductCategoriesByFilterSchema = z
    .object({
        id: idField,
        name: nameField,
        page: z.coerce.number().int().min(1).optional().default(PRODUCT_CATEGORY_QUERY_DEFAULTS.page),
        limit: z.coerce.number().int().min(1).max(100).optional().default(PRODUCT_CATEGORY_QUERY_DEFAULTS.limit),
    })
    .transform((raw) => ({
        filter: {
            id: raw.id,
            name: raw.name,
        },
        pagination: {
            page: raw.page,
            limit: raw.limit,
        },
    }));

export type GetProductCategoriesByFilterInput = z.infer<typeof GetProductCategoriesByFilterSchema>;