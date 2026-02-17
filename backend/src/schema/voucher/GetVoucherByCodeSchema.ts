import { z } from "zod";

export const GetVoucherByCodeSchema = z.object({
    code: z.string().min(1, "Code is required"),
});

export type GetVoucherByCodeInput = z.infer<typeof GetVoucherByCodeSchema>;
