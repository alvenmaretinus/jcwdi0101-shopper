import {z} from "zod";

export const ProductCategoryByIdSchema = z.strictObject({
    id: z.uuid("Invalid product category ID"),
});

