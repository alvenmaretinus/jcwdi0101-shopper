import {z} from "zod";
import { ProductByIdSchema } from "../product/ProductByIdSchema";

export const GetProductStoreByIdSchema = ProductByIdSchema;
export type GetProductStoreByIdInput = z.infer<typeof GetProductStoreByIdSchema>;