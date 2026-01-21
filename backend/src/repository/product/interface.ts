import { Product, GetProductReq, ProductWithStock, CreateProductReq } from "./entities";

export interface ProductsRepo {
    getProductsByFilter(filter: Partial<GetProductReq>): Promise<Product[]>;  
    getProductsByFilterWithStock(filter: Partial<GetProductReq>): Promise<ProductWithStock[]>;
    createProduct(data: CreateProductReq): Promise<Product>;
    updateProduct(id: string, data: Partial<CreateProductReq>): Promise<Product>;
    deleteProduct(id: string): Promise<void>;
}