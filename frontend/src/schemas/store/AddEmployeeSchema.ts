import { z } from "zod";

export const AddEmployeeSchema = z.strictObject({
  id: z.uuid("Invalid Store id"),
  userId: z.string().min(1, "User ID is required"),
});

export type AddEmployeeInput = z.infer<typeof AddEmployeeSchema>;
