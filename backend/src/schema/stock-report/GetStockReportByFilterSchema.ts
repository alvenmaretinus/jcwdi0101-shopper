import { skip } from "node:test";
import {z} from "zod";

export const GetStockReportByFilterSchema = z.strictObject({
    createdAtMonth: z.coerce.number().min(1).max(12),
    createdAtYear: z.coerce.number().min(1970),
    storeId: z.uuid(),
    skip: z.coerce.number().min(0).default(0),
    take: z.coerce.number().min(1).max(100).default(20),
});

export type GetStockReportByFilterInput = z.infer<typeof GetStockReportByFilterSchema>;