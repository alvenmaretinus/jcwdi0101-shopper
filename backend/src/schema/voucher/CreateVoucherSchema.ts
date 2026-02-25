import { z } from "zod";

export const CreateVoucherSchema = z
  .strictObject({
    code: z
      .string()
      .min(3, "Code must be at least 3 characters")
      .max(50, "Code must be at most 50 characters")
      .regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, hyphens, and underscores"),
    userId: z.uuid("Invalid user ID").optional(),
    name: z.string().min(1, "Name is required"),
    percentage: z.coerce.number().min(0).max(100).optional(),
    amount: z.coerce.number().int().min(0, "Amount must be at least 0").optional(),
    buyQuantity: z.coerce.number().int().min(1, "Buy quantity must be at least 1").optional(),
    freeQuantity: z.coerce.number().int().min(1, "Free quantity must be at least 1").optional(),
    type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "QUANTITY"]),
    voucherType: z.enum(["REFERRAL", "TRANSACTIONAL", "FREEDELIVERY"]),
    referralRole: z.enum(["REFERRER", "REFEREE"]).optional(),
    isWithMinimum: z.boolean().default(false),
    minimumPrice: z.coerce.number().int().min(0, "Minimum price must be at least 0").optional(),
    isQuantityLimited: z.boolean().default(false).optional(),
    maxUses: z.coerce.number().int().min(1, "Max uses must be at least 1").optional(),
    startsAt: z.coerce.date().optional(),
    endsAt: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "PERCENTAGE" && data.percentage === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["percentage"],
        message: "Percentage is required for PERCENTAGE type",
      });
    }

    if (data.type === "FIXED_AMOUNT" && data.amount === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["amount"],
        message: "Amount is required for FIXED_AMOUNT type",
      });
    }

    if (data.type === "QUANTITY") {
      if (data.buyQuantity === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["buyQuantity"],
          message: "Buy quantity is required for QUANTITY type",
        });
      }
      if (data.freeQuantity === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["freeQuantity"],
          message: "Free quantity is required for QUANTITY type",
        });
      }
    }
  });

export type CreateVoucherInput = z.infer<typeof CreateVoucherSchema>;
