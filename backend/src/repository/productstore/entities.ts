export type ProductStoreCreateInput = {
    quantity: number
    productId: string
    storeId: string
}

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
}

// Legacy type for backward compatibility
export type ProductStoreReq = ProductStoreCreateInput;