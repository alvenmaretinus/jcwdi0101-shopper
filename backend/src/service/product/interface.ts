import { Product } from "../../repository/product/entities";

export interface ProductService {
    getProductsByFilterWithOptionalStock(filter: Partial<any>, withStock: boolean): Promise<any[]>
    createProduct(data: any): Promise<Product>;
    updateProduct(id: string, data: any): Promise<Product>;
    deleteProduct(id: string): Promise<void>;
}

export type Service = ProductService;