import { z } from "zod";

export const CreateUserAddressSchema = z.object({
  addressName: z.string().min(1, "Address name is required"),
  addressType: z.enum(["HOME", "OFFICE"], "Address type is required"),
  recipientName: z.string().min(1, "Recipient name is required"),
  longitude: z.number(),
  latitude: z.number(),
});

export type CreateUserAddressInput = z.infer<typeof CreateUserAddressSchema>;
