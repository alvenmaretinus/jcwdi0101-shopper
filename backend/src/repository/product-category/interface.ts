import { GetProductCategoryReq, ProductCategory, CreateProductCategoryReq, UpdateProductCategoryReq } from "./entities";

export interface PaginationParams {
    page: number;
    limit: number;
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

export interface ProductCategoryRepo {
    getCategoriesByFilter(filter: Partial<GetProductCategoryReq>, pagination?: PaginationParams): Promise<PaginatedResponse<ProductCategory>>;
    getCategoryById(id: string): Promise<ProductCategory | null>;
    createCategory(data: CreateProductCategoryReq): Promise<ProductCategory>;
    updateCategory(id: string, data: UpdateProductCategoryReq): Promise<ProductCategory>;
    deleteCategory(id: string): Promise<void>;
}