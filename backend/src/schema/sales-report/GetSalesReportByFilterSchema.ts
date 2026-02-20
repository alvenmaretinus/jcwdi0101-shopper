import {z} from "zod";

export const GetSalesReportByFilterSchema = z.strictObject({
    storeId: z.uuid("Invalid store ID").optional(),
    monthAndYear: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid month and year format. Expected YYYY-MM"),
    categoryId: z.uuid("Invalid category ID").optional(),
    productName: z.string().min(1, "Product name cannot be empty").optional(),
    take: z.coerce.number().min(1, "Take must be at least 1").max(100, "Take cannot exceed 100").default(10),
    skip: z.coerce.number().min(0, "Skip cannot be negative").default(0),
});

type GetSalesReportByFilterInput = z.infer<typeof GetSalesReportByFilterSchema>;

export { GetSalesReportByFilterInput };



