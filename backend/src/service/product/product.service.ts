import {Service} from './interface';
import {ProductsRepo} from '../../repository/product/interface';
import { FilterInput } from '../../schema/product/GetProductsByFilterSchema';
import { CreateProductInput, UpdateProductInput } from '../../schema/product';
import { Product } from '../../repository/product/entities';

export class ProductService implements Service {
    private productRepo: ProductsRepo;

    constructor(productRepo: ProductsRepo) {
        this.productRepo = productRepo;
    }

    async getProductsByFilterWithOptionalStock(
        filter: Partial<FilterInput>,
        withStock: boolean
    ): Promise<Product[]>
    {
        if (withStock) {
            return this.productRepo.getProductsByFilterWithStock(filter);
        }
        return this.productRepo.getProductsByFilter(filter);
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

