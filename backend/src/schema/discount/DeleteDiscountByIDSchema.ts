import { z } from "zod";
import { DiscountByIdSchema } from "./DiscountByIdSchema";

export const DeleteDiscountByIdSchema = DiscountByIdSchema;

export type DeleteDiscountByIdInput = z.infer<typeof DeleteDiscountByIdSchema>;