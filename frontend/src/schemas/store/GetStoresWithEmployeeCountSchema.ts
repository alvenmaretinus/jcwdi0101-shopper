import { z } from "zod";

export const GetStoresWithEmployeeCountSchema = z.strictObject({
  // Pagination
  page: z.coerce.number().int().min(1).default(1),

  // Filtering
  search: z.string().optional(),

  // Sorting
  sortBy: z
    .enum(["isDefault", "employeeCount", "createdAt"])
    .default("isDefault"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type GetStoresWithEmployeeCountInput = z.infer<
  typeof GetStoresWithEmployeeCountSchema
>;
