import { MovementType } from './MovementType';

export type StockReport = {
    id: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    productId: string;
    product: {
        name: string;
    };
    orderId: string | null;
    quantityChange: number;
    movementType: MovementType;
    fromStoreId: string | null;
    fromStore: {
        name: string;
    };
    toStoreId: string | null;
    toStore: {
        name: string;
    };
}