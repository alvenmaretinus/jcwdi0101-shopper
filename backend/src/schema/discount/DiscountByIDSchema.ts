import { z } from "zod";

export const DiscountByIDSchema = z.strictObject({
    id : z.uuid("Invalid discount ID"),
});

