import { Product, ProductReq, ProductWithStock } from "./entities";

export interface ProductsRepo {
    getProductsByFilter(filter: Partial<ProductReq>): Promise<Product[]>;  
    getProductsByFilterWithStock(filter: Partial<ProductReq>): Promise<ProductWithStock[]>;
}