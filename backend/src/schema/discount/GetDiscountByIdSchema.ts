import { z } from "zod";
import { DiscountByIdSchema } from "./DiscountByIDSchema";

export const GetDiscountByIdSchema = DiscountByIdSchema;

export type GetDiscountByIdInput = z.infer<typeof GetDiscountByIdSchema>;
import { z } from "zod";
import { DiscountByIdSchema } from "./DiscountByIdSchema";

export const GetDiscountByIdSchema = DiscountByIdSchema;

export type GetDiscountByIdInput = z.infer<typeof GetDiscountByIdSchema>;