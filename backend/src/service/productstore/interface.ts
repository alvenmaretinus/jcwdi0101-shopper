import { ProductStore } from "../../repository/productstore/entities";
import { GetProductStoresByFilterInput, CreateProductStoreInput, UpdateProductStoreInput } from "../../schema/productstore";

interface ProductStoreService {
    createProductStore(data: CreateProductStoreInput): Promise<ProductStore>;
    getProductStoreByID(id: string): Promise<ProductStore | null>;
    getProductStoresByFilter(filter: Partial<GetProductStoresByFilterInput>): Promise<ProductStore[]>;
    updateProductStore(id: string, data: Partial<UpdateProductStoreInput>): Promise<ProductStore>;
    deleteProductStore(id: string): Promise<void>;
}

export type Service = ProductStoreService;
