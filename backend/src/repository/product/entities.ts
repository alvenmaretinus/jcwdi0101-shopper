export type GetProductReq = {
    id: string;
    name: string;
    categoryId: string;
    storeId: string;
    inStockOnly: boolean;
    // Additional filter fields can be added here when the logic is ready e.g. priceRange, createdAtRange
}

export type CreateProductReq = {
    name: string
    description?: string | null
    price: number
    createAt?: Date | string //TODO: Have this be changed to createdAt in future refactors
    updatedAt?: Date | string
    categoryId: string
    weight?: number
}

export type UpdateProductReq = {
    name?: string 
    description?: string | null | undefined
    price?: number
    createAt?: Date | string //TODO: Have this be changed to createdAt in future refactors
    updatedAt?: Date | string
    categoryId?: string
    weight?: number
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
            storeId?: string;
            quantity?: {
                gt: number;
            };
        };
    };
    isSoftDeleted: boolean; // Ensure this is always included to filter out soft-deleted products
}

export type ProductCategory = {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

export type ProductImage = {
    id: string;
    url: string;
    productId: string;
    createdAt: Date;
    updatedAt: Date;
}

export type Product = {
    id: string;
    name: string;
    description: string | null;
    updatedAt: Date;
    price: number;
    createAt: Date; //TODO: Have this be changed to createdAt in future refactors
    weight: number;
    categoryId: string;
    isSoftDeleted: boolean; // Optional field to indicate soft deletion status
    category?: ProductCategory; // Optional: included when queried with relations
    productImages?: ProductImage[]; // Optional: included when queried with relations
    // productStores removed from base Product type; use ProductWithStock when store-level data is needed
}

export type CalculatedDiscount = {
    id: string;
    name: string;
    label: string;
    savedAmount: number;
};

export type DiscountedPricing = {
    discountedPrice: number;
    totalDiscount: number;
    appliedCount: number;
    appliedDiscounts: CalculatedDiscount[];
    unmetMinimumDiscounts?: Array<{
        id: string;
        name: string;
        label: string;
        minimumPrice: number;
    }>;
};

export type ProductWithDiscounts = Product & {
    discountedPricing?: DiscountedPricing;
};

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


// Product augmented with computed stock information
export type ProductWithStock = Product & {
    // total stock across stores
    totalStock: number;
    // per-store stock records
    productStores: {
        storeId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        quantity: number;
        productId: string;
        store: Store;
    }[];
};

export type ProductWithStockAndDiscounts = ProductWithStock & {
    discountedPricing?: DiscountedPricing;
};
