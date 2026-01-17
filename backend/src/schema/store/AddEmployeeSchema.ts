import { z } from "zod";

export const AddEmployeeSchema = z.strictObject({
  id: z.uuid("Invalid Store id"),
  userId: z.uuid("Invalid User id"),
});

export type AddEmployeeInput = z.infer<typeof AddEmployeeSchema>;
