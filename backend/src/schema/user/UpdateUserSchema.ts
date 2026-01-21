import { z } from "zod";

export const UpdateUserSchema = z.strictObject({
  email: z.email("Invalid email address").optional(),
  role: z.enum(["USER", "ADMIN", "SUPERADMIN"]).optional(),
  profileUrl: z.string().url("Invalid profile URL").optional(),
  storeId: z.string().uuid("Invalid store ID").optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
