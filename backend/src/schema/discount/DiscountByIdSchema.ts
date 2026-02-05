import { z } from "zod";

export const DiscountByIdSchema = z.strictObject({
    id : z.uuid("Invalid discount ID"),
});

