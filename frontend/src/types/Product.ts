import { Store } from "./Store";

export type Product = {
    id: string;
    name: string;
    description: string | null;
    updatedAt: Date;
    price: number;
    createAt: Date; //TODO: Have this be changed to createdAt in future refactors
    categoryId: string;
    productStores?: {
        storeId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        quantity: number;
        productId: string;
        store: Store;
    }[];
}

