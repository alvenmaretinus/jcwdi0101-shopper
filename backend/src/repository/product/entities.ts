export type ProductReq = {
    name: string;
}

export type Product = {
    id: string;
    name: string;
    description: string | null;
    updatedAt: Date;
    price: number;
    createAt: Date;
    categoryId: string;
}

export type ProductWithStock = ({
    productStores: {
        storeId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        quantity: number;
        productId: string;
    }[];
} & {
    id: string;
    name: string;
    description: string | null;
    updatedAt: Date;
    price: number;
    createAt: Date;
    categoryId: string;
});
