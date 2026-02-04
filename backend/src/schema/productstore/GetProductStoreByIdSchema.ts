import {z} from "zod";
import { ProductStoreByIdSchema } from "../product/ProductStoreByIdSchema";

export const GetProductStoreByIdSchema = ProductStoreByIdSchema;
export type GetProductStoreByIdInput = z.infer<typeof GetProductStoreByIdSchema>;