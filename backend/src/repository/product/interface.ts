import { Product, GetProductReq, CreateProductReq, UpdateProductReq } from "./entities";

export interface ProductsRepo {
    getProductsByFilter(filter: Partial<GetProductReq>): Promise<Product[]>;  
    getProductsByFilterWithStock(filter: Partial<GetProductReq>): Promise<Product[]>;
    createProduct(data: CreateProductReq): Promise<Product>;
    updateProduct(id: string, data: Partial<UpdateProductReq>): Promise<Product>;
    deleteProduct(id: string): Promise<void>;
}