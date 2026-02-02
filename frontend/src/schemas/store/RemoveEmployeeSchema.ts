import { z } from "zod";

export const RemoveEmployeeSchema = z.strictObject({
  id: z.uuid("Invalid Store id"),
  employeeId: z.string().min(1, "Employee id is required"),
});

export type RemoveEmployeeInput = z.infer<typeof RemoveEmployeeSchema>;
