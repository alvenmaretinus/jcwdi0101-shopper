import {z} from "zod";
import { ProductStoreByIdSchema } from "../productstore/ProductStoreByIdSchema";

export const DeleteProductStoreByIdSchema = ProductStoreByIdSchema;
export type DeleteProductStoreByIdInput = z.infer<typeof DeleteProductStoreByIdSchema>;