import { z } from "zod";

export const CreateUserAddressSchema = z.object({
  userId: z.string().min(1,"User ID is required"),
  addressName: z.string().min(1,"Address name is required"),
  addressType: z.enum(["HOME", "OFFICE"]),
  recipientName: z.string().min(1,"Recipient name is required"),
  longitude: z.number(),
  latitude: z.number(),
  postCode: z.string().min(1,"Post code is required"),

});

export type CreateUserAddressInput = z.infer<typeof CreateUserAddressSchema>;
