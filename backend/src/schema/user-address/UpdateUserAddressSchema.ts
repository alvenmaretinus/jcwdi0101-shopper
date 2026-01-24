import { z } from "zod";

export const UpdateUserAddressSchema = z.object({
  id: z.uuid(),
  addressName: z.string().min(1),
  addressType: z.enum(["HOME", "OFFICE"]),
  recipientName: z.string().min(1),
  longitude: z.number(),
  latitude: z.number(),
  isDefault: z.boolean(),
});

export type UpdateUserAddressInput = z.infer<typeof UpdateUserAddressSchema>;
