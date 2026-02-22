import { MovementType } from "../../../prisma/generated/enums";

/**
 * Default messages and movement types for product stock operations
 * These are used when explicit values are not provided
 * Messages can be customized via environment variables
 */
export const PRODUCT_MOVEMENT_DEFAULTS = {
    CREATE: {
        message: process.env.PRODUCT_MOVEMENT_CREATE_MESSAGE || "Initial stock added on product store creation",
        movementType: MovementType.ADJUSTMENT,
    },
    UPDATE: {
        message: process.env.PRODUCT_MOVEMENT_UPDATE_MESSAGE || "Stock adjustment recorded on product store update",
        movementType: MovementType.ADJUSTMENT,
    },
    DELETE: {
        message: process.env.PRODUCT_MOVEMENT_DELETE_MESSAGE || "Stock removed on product store deletion",
        movementType: MovementType.ADJUSTMENT,
    },
    REALLOCATE: {
        message: (fromStoreId: string, toStoreId: string) => {
            const template = process.env.PRODUCT_MOVEMENT_REALLOCATE_MESSAGE || 
                "Stock reallocated from store {fromStoreId} to store {toStoreId}";
            return template
                .replace("{fromStoreId}", fromStoreId)
                .replace("{toStoreId}", toStoreId);
        },
        movementType: MovementType.REALLOCATED,
    },
    SOLD: {
        message: process.env.PRODUCT_MOVEMENT_SOLD_MESSAGE || "Product sold through order",
        movementType: MovementType.SOLD,
    },
    CANCELED: {
        message: process.env.PRODUCT_MOVEMENT_CANCELED_MESSAGE || "Order cancelled, stock refunded",
        movementType: MovementType.CANCELED,
    },
    PURCHASED: {
        message: process.env.PRODUCT_MOVEMENT_PURCHASED_MESSAGE || "Stock purchased from supplier",
        movementType: MovementType.PURCHASED,
    },
} as const;
