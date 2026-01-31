import {z} from "zod";

export const GetStockReportByFilterSchema = z.strictObject({
    createdAtMonth: z.coerce.number().min(1).max(12),
    createdAtYear: z.coerce.number().min(1970),
    storeId: z.uuid(),
});

export type GetStockReportByFilterInput = z.infer<typeof GetStockReportByFilterSchema>;