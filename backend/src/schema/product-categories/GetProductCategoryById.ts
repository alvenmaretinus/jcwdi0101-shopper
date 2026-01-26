import { z } from "zod";
import { ProductCategoryByIdSchema } from "./ProductCategoryById";

export const GetProductCategoryByIdSchema = ProductCategoryByIdSchema;
export type GetProductCategoryByIdInput = z.infer<typeof GetProductCategoryByIdSchema>;