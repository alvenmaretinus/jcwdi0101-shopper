export type ProductReq = {
    id: string;
    name: string;
    categoryId: string;
    storeId: string;
}

export type ProductWhereClause = {
    id?: string;
    categoryId?: string;
    name?: {
        contains: string;
        mode: 'insensitive';
    };
    productStores?: {
        some: {
            storeId: string;
        };
    };
}

export type Product = {
    id: string;
    name: string;
    description: string | null;
    updatedAt: Date;
    price: number;
    createAt: Date; //TODO: Have this be changed to createdAt in future refactors
    categoryId: string;
}

export type Store = {
    id: string;
    name: string;
    description: string | null;
    phone: string;
    longitude: number;
    latitude: number;
    addressName: string;
    createdAt: Date;
    updatedAt: Date;
}

export type ProductWithStock = ({
    productStores: {
        storeId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        quantity: number;
        productId: string;
        store: Store;
    }[];
} & {
    id: string;
    name: string;
    description: string | null;
    updatedAt: Date;
    price: number;
    createAt: Date; //TODO: Have this be changed to createdAt in future refactors
    categoryId: string;
});
