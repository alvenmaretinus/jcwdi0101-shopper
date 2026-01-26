export type ProductStoreReq = {
    quantity: number
    productId: string
    storeId: string
}

export type ProductStore = {
    id: string;
    storeId: string;
    updatedAt: Date;
    createdAt: Date;
    productId: string;
    quantity: number;
}