import {Service} from './interface';
import {ProductsRepo, PaginationParams, PaginatedResponse} from '../../repository/product/interface';
import { FilterInput } from '../../schema/product/GetProductsByFilterSchema';
import { CreateProductInput, UpdateProductInput } from '../../schema/product';
import { Product, ProductWithStock } from '../../repository/product/entities';

export class ProductService implements Service {
    private productRepo: ProductsRepo;

    constructor(productRepo: ProductsRepo) {
        this.productRepo = productRepo;
    }

    async getProductsByFilterWithOptionalStock(
        filter: Partial<FilterInput>,
        withStock: boolean,
        pagination?: PaginationParams
    ): Promise<PaginatedResponse<Product> | PaginatedResponse<ProductWithStock>>
    {
        if (withStock) {
            return this.productRepo.getProductsByFilterWithStock(filter, pagination);
        }
        return this.productRepo.getProductsByFilter(filter, pagination);
    }

    async createProduct(data: CreateProductInput): Promise<Product> {
        return this.productRepo.createProduct(data);
    }

    async updateProduct(data: UpdateProductInput): Promise<Product> {
        const {id, ...updateData} = data;
        return this.productRepo.updateProduct(id, updateData);
    }

    async deleteProduct(id: string): Promise<void> {
        return this.productRepo.deleteProduct(id);
    }
} 

