import { z } from "zod";

export const CreateUserSchema = z.strictObject({
  email: z.email("Invalid email address"),
  role: z.enum(["USER", "ADMIN", "SUPERADMIN"]).optional().default("USER"),
  profileUrl: z.string().url("Invalid profile URL").optional(),
  storeId: z.string().uuid("Invalid store ID").optional(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;
