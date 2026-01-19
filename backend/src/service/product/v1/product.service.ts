import {Service} from '../interface';
import {ProductsRepo} from '../../../repository/product/interface';

export class ProductService implements Service {
    private productRepo: ProductsRepo;

    constructor(productRepo: ProductsRepo) {
        this.productRepo = productRepo;
    }


    async getProductsByFilterWithOptionalStock(filter: Partial<any>, withStock: boolean): Promise<any[]> {
        if (withStock) {
            return this.productRepo.getProductsByFilterWithStock(filter);
        } else {
            return this.productRepo.getProductsByFilter(filter);
        }
    }
} 