import { z } from "zod";

export const GetStoreByIdSchema = z.strictObject({
  id: z.uuid("Invalid store ID"),
  employee: z.coerce.boolean().default(false).optional(),
});

export type GetStoreByIdInput = z.infer<typeof GetStoreByIdSchema>;
