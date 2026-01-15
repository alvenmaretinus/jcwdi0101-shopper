import { z } from "zod";

export const CreateStoreSchema = z.strictObject({
  name: z.string().min(1, "Store name is required"),
  location: z.object({ lat: z.number(), lng: z.number() }),
  description: z.string().optional(),
  addressName: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
});

export type CreateStoreInput = z.infer<typeof CreateStoreSchema>;
