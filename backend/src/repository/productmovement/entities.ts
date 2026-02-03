import { MovementType } from "../../../prisma/generated/enums";

export type ProductMovementReq = {
    orderId: string | null;
    quantityChange: number;
    movementType: MovementType;
    description: string | null;
    productId: string; //All product-related data should be fetched using relations
    fromStoreId?: string | null;
    toStoreId?: string | null;
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
}