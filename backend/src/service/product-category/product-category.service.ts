import { ProductCategoryRepo } from "../../repository/product-category/interface";
import { CreateProductCategoryInput, GetProductCategoriesByFilterInput, UpdateProductCategoryInput } from "../../schema/product-categories";
import { ProductCategory } from "../../repository/product-category/entities";
import { Service } from "./interface";
import { PaginationParams, PaginatedResponse } from "../../repository/product-category/interface";


export class ProductCategoryService implements Service {
    private productCategoryRepo: ProductCategoryRepo;
    constructor(productCategoryRepo: ProductCategoryRepo) {
        this.productCategoryRepo = productCategoryRepo;
    }
    async getProductCategoriesByFilter(
        filter: Partial<GetProductCategoriesByFilterInput["filter"]>,
        pagination?: PaginationParams,
    ): Promise<PaginatedResponse<ProductCategory>>{
        return this.productCategoryRepo.getCategoriesByFilter(filter, pagination);
    }
    async getProductCategoryById(id: string): Promise<ProductCategory | null> {
        return this.productCategoryRepo.getCategoryById(id);
    }
    async createProductCategory(data: CreateProductCategoryInput): Promise<ProductCategory> {
        return this.productCategoryRepo.createCategory(data);
    }
    async updateProductCategory(data: UpdateProductCategoryInput): Promise<ProductCategory> {
        const {id , ...updateData} = data;
        return this.productCategoryRepo.updateCategory(id, updateData);
    }
    async deleteProductCategory(id: string): Promise<void> {
        return this.productCategoryRepo.deleteCategory(id);
    }
}
