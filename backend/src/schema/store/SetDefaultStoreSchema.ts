import { z } from "zod";

export const SetDefaultStoreSchema = z.strictObject({
  id: z.uuid(),
});

export type SetDefaultStoreInput = z.infer<typeof SetDefaultStoreSchema>;
