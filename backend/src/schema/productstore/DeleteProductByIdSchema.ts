import {z} from "zod";
import { ProductByIdSchema } from "../product/ProductByIdSchema";

export const DeleteProductStoreByIdSchema = ProductByIdSchema;
export type DeleteProductStoreByIdInput = z.infer<typeof DeleteProductStoreByIdSchema>;