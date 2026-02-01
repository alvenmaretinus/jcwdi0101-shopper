import { z } from "zod";

export const CreateStoreSchema = z.strictObject({
  name: z.string().min(1, "Store name is required"),
  coords: z.object({ lat: z.coerce.number(), lng: z.coerce.number() }),
  description: z.string().optional(),
  addressName: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  postCode: z.string().min(1, "Post code is required"),
});

export type CreateStoreInput = z.infer<typeof CreateStoreSchema>;
