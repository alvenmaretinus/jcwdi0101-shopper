import { z } from "zod";

export const CallbackSchema = z.object({
  code: z.string().min(1, "Code is required"),
});

export type CallbackInput = z.infer<typeof CallbackSchema>;
