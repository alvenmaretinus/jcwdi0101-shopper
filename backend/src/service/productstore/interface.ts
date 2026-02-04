import { ProductStore } from "../../repository/productstore/entities";
import { GetProductStoresByFilterInput, CreateProductStoreInput, UpdateProductStoreInput } from "../../schema/productstore";

interface ProductStoreService {
    createProductStore(data: CreateProductStoreInput): Promise<ProductStore>;
    getProductStoreByID(id: string): Promise<ProductStore | null>;
    getProductStoresByFilter(filter: GetProductStoresByFilterInput): Promise<ProductStore[]>;
    updateProductStore(data: UpdateProductStoreInput): Promise<ProductStore>;
    deleteProductStore(id: string): Promise<void>;
}

export type Service = ProductStoreService;
