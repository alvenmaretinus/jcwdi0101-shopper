import { z } from "zod";

export const CallbackSchema = z.object({
  accessToken: z.string().min(1, "Access token is required"),
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type CallbackInput = z.infer<typeof CallbackSchema>;
