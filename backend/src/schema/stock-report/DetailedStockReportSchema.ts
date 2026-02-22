import { z } from "zod";
import { MovementType } from "../../../prisma/generated/enums";

export const GetDetailedStockReportSchema = z.strictObject({
    createdAtMonth: z.coerce.number().min(1).max(12),
    createdAtYear: z.coerce.number().min(1970),
    productId: z.uuid(),
    storeId: z.uuid("Store ID is required for detailed reports"),
    skip: z.coerce.number().min(0).default(0),
    take: z.coerce.number().min(1).max(100).default(20),
});

export type GetDetailedStockReportInput = z.infer<typeof GetDetailedStockReportSchema>;

/**
 * Detailed inventory history for a specific product in a month
 */
export type DetailedStockReportItem = {
    id: string;
    date: Date;
    movementType: MovementType;
    description: string | null;
    fromStore: string | null;
    toStore: string | null;
    quantityChange: number;
    endStock: number | null;
};

export type DetailedStockReport = {
    productId: string;
    productName: string;
    month: number;
    year: number;
    movements: DetailedStockReportItem[];
    startingStock: number;
    endingStock: number;
};
