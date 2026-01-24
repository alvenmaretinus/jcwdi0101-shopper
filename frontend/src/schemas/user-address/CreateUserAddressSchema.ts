import { z } from "zod";

export const CreateUserAddressSchema = z.object({
  addressName: z.string().min(1),
  addressType: z.enum(["HOME", "OFFICE"]),
  recipientName: z.string().min(1),
  longitude: z.number(),
  latitude: z.number(),
});

export type CreateUserAddressInput = z.infer<typeof CreateUserAddressSchema>;
