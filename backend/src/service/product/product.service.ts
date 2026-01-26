import {Service} from './interface';
import {ProductsRepo} from '../../repository/product/interface';
import { FilterInput } from '../../schema/product/GetProductsByFilterSchema';
import { CreateProductInput, UpdateProductInput } from '../../schema/product';

export class ProductService implements Service {
    private productRepo: ProductsRepo;

    constructor(productRepo: ProductsRepo) {
        this.productRepo = productRepo;
    }

    async getProductsByFilterWithOptionalStock(
        filter: Partial<FilterInput>,
        withStock: boolean
    ): Promise<
        | Awaited<ReturnType<ProductsRepo['getProductsByFilterWithStock']>>
        | Awaited<ReturnType<ProductsRepo['getProductsByFilter']>>
    > {
        if (withStock) {
            return this.productRepo.getProductsByFilterWithStock(filter);
        } else {
            return this.productRepo.getProductsByFilter(filter);
        }
    }

    async createProduct(data: CreateProductInput): Promise<any> {
        return this.productRepo.createProduct(data);
    }

    async updateProduct(id: string, data: UpdateProductInput): Promise<any> {
        return this.productRepo.updateProduct(id, data);
    }

    async deleteProduct(id: string): Promise<void> {
        return this.productRepo.deleteProduct(id);
    }
} 

