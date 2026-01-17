import { z } from "zod";

export const GetUserByIdSchema = z.strictObject({
  id: z.string().min(1, "User ID is required"),
});

export type GetUserByIdInput = z.infer<typeof GetUserByIdSchema>;
