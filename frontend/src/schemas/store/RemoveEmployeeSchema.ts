import { z } from "zod";

export const RemoveEmployeeSchema = z.strictObject({
  id: z.uuid("Invalid Store id"),
  employeeId: z.uuid("Invalid Employee id"),
});

export type RemoveEmployeeInput = z.infer<typeof RemoveEmployeeSchema>;
