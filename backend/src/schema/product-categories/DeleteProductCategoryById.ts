import { z } from "zod";
import { ProductCategoryByIdSchema } from "./ProductCategoryById";

export const DeleteProductCategoryByIdSchema = ProductCategoryByIdSchema;
export type DeleteProductCategoryByIdInput = z.infer<typeof DeleteProductCategoryByIdSchema>;