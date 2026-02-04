import {z} from "zod";
import { ProductStoreByIdSchema } from "./ProductStoreByIdSchema";

export const GetProductStoreByIdSchema = ProductStoreByIdSchema;

export type GetProductStoreByIdInput = z.infer<typeof GetProductStoreByIdSchema>;