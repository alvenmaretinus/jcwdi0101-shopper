import { z } from "zod";

export const FindStoreByIdSchema = z.strictObject({
  id: z.uuid("Invalid store ID"),
});

export type FindStoreByIdInput = z.infer<typeof FindStoreByIdSchema>;
