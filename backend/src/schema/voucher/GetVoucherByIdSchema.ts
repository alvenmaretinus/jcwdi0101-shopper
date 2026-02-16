import { z } from "zod";

export const GetVoucherByIdSchema = z.object({
    id: z.uuid("Invalid voucher ID"),
});

export type GetVoucherByIdInput = z.infer<typeof GetVoucherByIdSchema>;
