import { Product, GetProductReq, CreateProductReq, UpdateProductReq, ProductWithStock } from "./entities";

export interface PaginationParams {
    page: number;
    limit: number;
    sort?: "featured" | "name" | "price-low" | "price-high";
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ProductsRepo {
    getProductsByFilter(filter: Partial<GetProductReq>, pagination?: PaginationParams): Promise<PaginatedResponse<Product>>;  
    getProductsByFilterWithStock(filter: Partial<GetProductReq>, pagination?: PaginationParams): Promise<PaginatedResponse<ProductWithStock>>;
    createProduct(data: CreateProductReq): Promise<Product>;
    updateProduct(id: string, data: Partial<UpdateProductReq>): Promise<Product>;
    deleteProduct(id: string): Promise<void>;
}