import { z } from "zod";

export const UpdateUserSchema = z.strictObject({
  email: z.email("Invalid email address").optional(),
  role: z.enum(["USER", "ADMIN", "SUPERADMIN"]).optional(),
  image: z.url("Invalid profile URL").optional(),
  storeId: z.uuid("Invalid store ID").optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
