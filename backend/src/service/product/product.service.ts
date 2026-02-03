import {Service} from './interface';
import {ProductsRepo} from '../../repository/product/interface';
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
        withStock: boolean
    ): Promise<
        ProductWithStock[]
        |Product[]>
    {
        if (withStock) {
            return this.productRepo.getProductsByFilterWithStock(filter);
        } else {
            return this.productRepo.getProductsByFilter(filter);
        }
    }

    async createProduct(data: CreateProductInput): Promise<Product> {
        return this.productRepo.createProduct(data);
    }

    async updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
        return this.productRepo.updateProduct(id, data);
    }

    async deleteProduct(id: string): Promise<void> {
        return this.productRepo.deleteProduct(id);
    }
} 

