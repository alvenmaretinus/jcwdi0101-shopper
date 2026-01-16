import { z } from "zod";

export const DeleteStoreByIdSchema = z.strictObject({
  id: z.uuid("Invalid store ID"),
});

export type DeleteStoreByIdInput = z.infer<typeof DeleteStoreByIdSchema>;
