import { z } from "zod";

export const DeleteVoucherByIdSchema = z.object({
    id: z.uuid("Invalid voucher ID"),
});

export type DeleteVoucherByIdInput = z.infer<typeof DeleteVoucherByIdSchema>;
