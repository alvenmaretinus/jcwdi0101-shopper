export type ProductStoreCreateInput = {
    quantity: number
    productId: string
    storeId: string
}

// Note: Only `quantity` is updatable. `productId` and `storeId` are immutable after creation
// and cannot be changed via update operations.
// Note: Only `quantity` is updatable. `productId` and `storeId` are immutable after creation
// and cannot be changed via update operations.
export type ProductStoreUpdateInput = {
    quantity?: number
}

export type ProductStoreGetInput = {
    id?: string
    storeId?: string
    productId?: string
    quantity?: number
}

export type ProductStore = {
    id: string;
    storeId: string;
    updatedAt: Date;
    createdAt: Date;
    productId: string;
    quantity: number;
    productName?: string;
    storeName?: string;
}

// Legacy type for backward compatibility
export type ProductStoreReq = ProductStoreCreateInput;