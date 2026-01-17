import {z} from "zod";

export const GetUsersByFilterSchema = z.strictObject({
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(["USER", "ADMIN", "SUPERADMIN"]).optional(),
  storeId: z.string().uuid("Invalid store ID").optional(),
  referralCode: z.string().uuid("Invalid referral code").optional(),
});

export type GetUsersByFilterInput = z.infer<typeof GetUsersByFilterSchema>;