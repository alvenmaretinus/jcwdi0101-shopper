import {z} from "zod";

export const GetSalesReportByFilterSchema = z.strictObject({
    storeId: z.uuid("Invalid store ID"),
    monthAndYear: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid month and year format. Expected YYYY-MM"),
    categoryId: z.uuid("Invalid category ID").optional(),
    productName: z.string().min(1, "Product name cannot be empty").optional(),
});

type GetSalesReportByFilterInput = z.infer<typeof GetSalesReportByFilterSchema>;

export { GetSalesReportByFilterInput };



