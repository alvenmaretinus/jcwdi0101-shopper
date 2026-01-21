import {Service} from './interface';
import {ProductsRepo} from '../../repository/product/interface';
import { FilterInput } from '../../schema/product/GetProductsByFilterSchema';

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

    async createProduct(data: any): Promise<any> {
        return this.productRepo.createProduct(data);
    }

    async updateProduct(id: string, data: any): Promise<any> {
        return this.productRepo.updateProduct(id, data);
    }

    async deleteProduct(id: string): Promise<void> {
        return this.productRepo.deleteProduct(id);
    }
} 

