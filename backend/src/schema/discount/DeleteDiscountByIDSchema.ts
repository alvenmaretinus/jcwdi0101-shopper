import { z } from "zod";
import { DiscountByIDSchema } from "./DiscountByIDSchema";

export const DeleteDiscountByIDSchema = DiscountByIDSchema;

export type DeleteDiscountByIDInput = z.infer<typeof DeleteDiscountByIDSchema>;