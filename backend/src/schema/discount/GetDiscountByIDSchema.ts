import { z } from "zod";
import { DiscountByIDSchema } from "./DiscountByIDSchema";

export const GetDiscountByIDSchema = DiscountByIDSchema;

export type GetDiscountByIDInput = z.infer<typeof GetDiscountByIDSchema>;