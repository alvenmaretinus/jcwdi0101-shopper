import { z } from "zod";

export const UserAddressIdSchema = z.object({
  id: z.string().min(1, "Address ID is required"),
});

export type UserAddressIdInput = z.infer<typeof UserAddressIdSchema>;
