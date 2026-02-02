import { GetProductCategoryReq, ProductCategory, CreateProductCategoryReq, UpdateProductCategoryReq } from "./entities";

export interface ProductCategoryRepo {
    getCategoriesByFilter(filter: Partial<GetProductCategoryReq>): Promise<ProductCategory[]>;
    getCategoryById(id: string): Promise<ProductCategory | null>;
    createCategory(data: CreateProductCategoryReq): Promise<ProductCategory>;
    updateCategory(id: string, data: UpdateProductCategoryReq): Promise<ProductCategory>;
    deleteCategory(id: string): Promise<void>;
}