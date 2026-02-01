import { z } from "zod";

export const GetNearestStoreSchema = z.strictObject({
  latitude: z.number(),
  longitude: z.number(),
  radiusMeters: z.number().optional(),
});

export type GetNearestStoreInput = z.infer<typeof GetNearestStoreSchema>;
