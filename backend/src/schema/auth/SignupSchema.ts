import { z } from "zod";

export const SignupSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters"),
});

export type SignupInput = z.infer<typeof SignupSchema>;
