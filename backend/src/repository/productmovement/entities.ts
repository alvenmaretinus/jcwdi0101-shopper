import { MovementType } from "../../../prisma/generated/enums";

export type ProductMovementReq = {
    orderId: string | null;
    quantityChange: number;
    movementType: MovementType;
    description: string | null;
    productId: string;
    fromStoreName?: string | null;
    toStoreName?: string | null;
}

export type ProductMovement = {
    id: string;
    orderId: string | null;
    quantityChange: number;
    createdAt: Date;
    updatedAt: Date;
    productName: string;
    productCategory: string;
    movementType: MovementType;
    description: string | null;
    fromStoreName: string | null;
    toStoreName: string | null;
    productId: string;
}