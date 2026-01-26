import { GetProductCategoryReq, ProductCategory, CreateProductCategoryReq } from "./entities";

export interface ProductCategoryRepo {
    getCategoriesByFilter(filter: Partial<GetProductCategoryReq>): Promise<ProductCategory[]>;
    getCategoryById(id: string): Promise<ProductCategory | null>;
    createCategory(data: CreateProductCategoryReq): Promise<ProductCategory>;
    updateCategory(id: string, data: ProductCategory): Promise<ProductCategory>;
    deleteCategory(id: string): Promise<void>;
}