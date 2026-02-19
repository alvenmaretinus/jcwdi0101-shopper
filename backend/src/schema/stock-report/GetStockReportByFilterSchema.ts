import {z} from "zod";

export const GetStockReportByFilterSchema = z.strictObject({
    createdAtMonth: z.coerce.number().min(1).max(12),
    createdAtYear: z.coerce.number().min(1970), // We allow reports from 1970 onwards, regardless of the year.
    storeId: z.uuid().optional(),
    skip: z.coerce.number().min(0).default(0),
    take: z.coerce.number().min(1).max(100).default(20),
});

export type GetStockReportByFilterInput = z.infer<typeof GetStockReportByFilterSchema>;