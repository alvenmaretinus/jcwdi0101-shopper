import { z } from "zod";

export const GetNearestProductsSchema = z.object({
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
});

export type GetNearestProductsInput = z.infer<typeof GetNearestProductsSchema>;
