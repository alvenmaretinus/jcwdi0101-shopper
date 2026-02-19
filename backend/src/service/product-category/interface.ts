import { ProductCategory } from "../../repository/product-category/entities";
import { PaginationParams, PaginatedResponse } from "../../repository/product-category/interface";
import { CreateProductCategoryInput, GetProductCategoriesByFilterInput, UpdateProductCategoryInput } from "../../schema/product-categories";

interface ProductCategoryService {
    getProductCategoriesByFilter(filter: Partial<GetProductCategoriesByFilterInput["filter"]>, pagination?: PaginationParams): Promise<PaginatedResponse<ProductCategory>>;
    getProductCategoryById(id: string): Promise<ProductCategory | null>;
    createProductCategory(data: CreateProductCategoryInput): Promise<ProductCategory>;
    updateProductCategory(data: UpdateProductCategoryInput): Promise<ProductCategory>;
    deleteProductCategory(id: string): Promise<void>;
}

export type Service = ProductCategoryService;