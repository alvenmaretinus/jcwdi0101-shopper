import {z} from "zod";

export const UpdateProductStoreSchema = z.strictObject({
    id: z.uuid("Invalid product store ID"),
    quantity: z.number().int("Quantity must be an integer").min(0, "Quantity cannot be negative").optional(),
    fromStoreId: z.uuid("Invalid from store ID").optional(),
    toStoreId: z.uuid("Invalid to store ID").optional(),
    transferQuantity: z.number().int("Transfer quantity must be an integer").min(1, "Transfer quantity must be at least 1").optional(),
    movementMessage: z.string().max(500, "Movement message must be at most 500 characters").optional(),
    movementType: z.enum(["PURCHASED", "SOLD", "REALLOCATED", "CANCELED", "ADJUSTMENT"]).optional()
}).refine(
    (data) => {
        // If transferring between stores, require both fromStoreId and toStoreId
        const hasTransferFields = data.fromStoreId || data.toStoreId || data.transferQuantity;
        if (hasTransferFields) {
            return data.fromStoreId && data.toStoreId && data.transferQuantity;
        }
        return true;
    },
    {
        message: "When transferring between stores, fromStoreId, toStoreId, and transferQuantity are all required"
    }
);

export type UpdateProductStoreInput = z.infer<typeof UpdateProductStoreSchema>;