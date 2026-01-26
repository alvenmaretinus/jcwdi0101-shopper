import { ProductCategoryRepo } from "../../repository/product-category/interface";
import { CreateProductCategoryInput, GetProductCategoriesByFilterInput } from "../../schema/product-categories";
import { ProductCategory } from "../../repository/product-category/entities";
import { Service } from "./interface";


export class ProductCategoryService implements Service {
    private productCategoryRepo: ProductCategoryRepo;
    constructor(productCategoryRepo: ProductCategoryRepo) {
        this.productCategoryRepo = productCategoryRepo;
    }
    async getProductCategoriesByFilter(filter: Partial<GetProductCategoriesByFilterInput>): Promise<ProductCategory[]>{
        return this.productCategoryRepo.getCategoriesByFilter(filter);
    }
    async getProductCategoryById(id: string): Promise<ProductCategory | null> {
        return this.productCategoryRepo.getCategoryById(id);
    }
    async createProductCategory(data: CreateProductCategoryInput): Promise<ProductCategory> {
        return this.productCategoryRepo.createCategory(data);
    }
    async updateProductCategory(id: string, data: ProductCategory): Promise<ProductCategory> {
        return this.productCategoryRepo.updateCategory(id, data);
    }
    async deleteProductCategory(id: string): Promise<void> {
        return this.productCategoryRepo.deleteCategory(id);
    }
}
