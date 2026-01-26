import {z} from "zod";

export const GetProductCategoriesByFilterSchema = z.strictObject({
    id: z.uuid().optional(),
    category: z.string().optional(),
});

export type GetProductCategoriesByFilterInput = z.infer<typeof GetProductCategoriesByFilterSchema>;