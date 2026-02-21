import { Product, ProductWithStock } from "../../repository/product/entities";
import { CreateProductInput, FilterInput, UpdateProductInput } from "../../schema/product";
import { PaginationParams, PaginatedResponse } from "../../repository/product/interface";

export interface ProductService {
    getProductsByFilterWithOptionalStock(filter: Partial<FilterInput>, withStock: boolean, withDiscounts?: boolean, pagination?: PaginationParams): Promise<PaginatedResponse<Product> | PaginatedResponse<ProductWithStock>>;
    createProduct(data: CreateProductInput): Promise<Product>;
    updateProduct(data: UpdateProductInput): Promise<Product>;
    deleteProduct(id: string): Promise<void>;
}

export type Service = ProductService;