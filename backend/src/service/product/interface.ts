import { Product, ProductWithStock } from "../../repository/product/entities";
import { CreateProductInput, FilterInput, UpdateProductInput } from "../../schema/product";

export interface ProductService {
    getProductsByFilterWithOptionalStock(filter: Partial<FilterInput>, withStock: boolean): Promise<Product[] | ProductWithStock[]>;
    createProduct(data: CreateProductInput): Promise<Product>;
    updateProduct(data: UpdateProductInput): Promise<Product>;
    deleteProduct(id: string): Promise<void>;
}

export type Service = ProductService;