import { z } from "zod";

export const UpdateStoreSchema = z.strictObject({
  id: z.uuid(),
  name: z.string().min(1, "Store name is required").optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  description: z.string().optional(),
  addressName: z.string().min(1, "Address is required").optional(),
  phone: z.string().min(1, "Phone number is required").optional(),
});

export type UpdateStoreInput = z.infer<typeof UpdateStoreSchema>;
