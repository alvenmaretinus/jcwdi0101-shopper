import { MovementType } from "../../../prisma/generated/enums";

export type CreateProductMovementReq = {
    orderId: string | null;
    quantityChange: number;
    movementType: MovementType;
    description: string | null;
    productId: string; //All product-related data should be fetched using relations
    fromStoreId?: string | null;
    toStoreId?: string | null;
    endStock?: number; // Calculated field
}

export type GetProductMovementReq = {
    orderId: string;
    quantityChange: number;
    movementType: MovementType;
    description: string;
    productId: string; //All product-related data should be fetched using relations
    fromStoreId: string;
    toStoreId: string;
}

export type ProductMovement = {
    id: string;
    orderId: string | null;
    quantityChange: number;
    createdAt: Date;
    updatedAt: Date;
    movementType: MovementType;
    description: string | null;
    fromStoreId: string | null;
    toStoreId: string | null;
    productId: string;
    endStock: number | null;
}