import { z } from "zod";

export const AddToCartSchema = z.object({
  storeId: z.uuid(),
  productId: z.uuid(),
  quantity: z.number().int().min(1).optional(),
});
