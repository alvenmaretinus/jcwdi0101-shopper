import { z } from "zod";

export const AddToCartSchema = z.object({
  productId: z.uuid(),
  quantity: z.number().int().min(1).optional(),
});
