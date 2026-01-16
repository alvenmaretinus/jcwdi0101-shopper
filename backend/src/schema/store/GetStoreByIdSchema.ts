import { z } from "zod";

export const GetStoreByIdSchema = z.strictObject({
  id: z.uuid("Invalid store ID"),
});

export type GetStoreByIdInput = z.infer<typeof GetStoreByIdSchema>;
