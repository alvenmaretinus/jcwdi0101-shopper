import { z } from "zod";

export const GetNearestProductsSchema = z.object({
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type GetNearestProductsInput = z.infer<typeof GetNearestProductsSchema>;
