import { z } from "zod";

export const UpdateUserSchema = z.strictObject({
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(["USER", "ADMIN", "SUPERADMIN"]).optional(),
  profileUrl: z.string().url("Invalid profile URL").optional().nullable(),
  referralCode: z.string().optional(),
  storeId: z.string().uuid("Invalid store ID").optional().nullable(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
