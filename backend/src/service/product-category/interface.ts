import { ProductCategory } from "../../repository/product-category/entities";
import { CreateProductCategoryInput, GetProductCategoriesByFilterInput } from "../../schema/product-categories";

interface ProductCategoryService {
    getProductCategoriesByFilter(filter: Partial<GetProductCategoriesByFilterInput>): Promise<ProductCategory[]>;
    getProductCategoryById(id: string): Promise<ProductCategory | null>;
    createProductCategory(data: CreateProductCategoryInput): Promise<ProductCategory>;
    updateProductCategory(id: string, data: ProductCategory): Promise<ProductCategory>;
    deleteProductCategory(id: string): Promise<void>;
}

export type Service = ProductCategoryService;