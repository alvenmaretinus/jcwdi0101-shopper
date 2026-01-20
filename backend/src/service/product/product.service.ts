import {Service} from './interface';
import {ProductsRepo} from '../../repository/product/interface';
import { FilterInput } from '../../schema/product/GetProductsByFilterSchema';

export class ProductService implements Service {
    private productRepo: ProductsRepo;

    constructor(productRepo: ProductsRepo) {
        this.productRepo = productRepo;
    }


    async getProductsByFilterWithOptionalStock(filter: Partial<FilterInput>, withStock: boolean): Promise<any[]> {
        if (withStock) {
            return this.productRepo.getProductsByFilterWithStock(filter);
        } else {
            return this.productRepo.getProductsByFilter(filter);
        }
    }
} 