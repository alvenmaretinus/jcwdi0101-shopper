import { z } from "zod";

export const GetSummaryStockReportSchema = z.strictObject({
    createdAtMonth: z.coerce.number().min(1).max(12),
    createdAtYear: z.coerce.number().min(1970),
    storeId: z.uuid().optional(),
    skip: z.coerce.number().min(0).default(0),
    take: z.coerce.number().min(1).max(100).default(20),
});

export type GetSummaryStockReportInput = z.infer<typeof GetSummaryStockReportSchema>;

/**
 * Summary stock report showing:
 * - Product ID and name
 * - Total additions (PURCHASED, REALLOCATED TO this store)
 * - Total reductions (SOLD, REALLOCATED FROM this store)
 * - Ending stock (current quantity at store)
 */
export type SummaryStockReport = {
    productId: string;
    productName: string;
    totalAdditions: number;
    totalReductions: number;
    endingStock: number;
    month: number;
    year: number;
};
