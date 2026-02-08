import { z } from "zod";

export const GetShippingCostSchema = z.object({
  originPostCode: z.string().min(1, "Origin post code is required"),
  destinationPostCode: z.string().min(1, "Destination post code is required"),
  weight: z.coerce.number().min(1, "Weight is required"),
  itemValue: z.coerce.number().min(1, "Item value is required"),
});

export type GetShippingCostInput = z.infer<typeof GetShippingCostSchema>;
