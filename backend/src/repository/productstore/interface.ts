import { ProductStore, ProductStoreReq } from "./entities";

export interface ProductStoreRepo {
    createProductStore(data: ProductStoreReq): Promise<ProductStore>;
    getProductStoreByID(id: string): Promise<ProductStore | null>;
    getProductStoresByFilter(filter: Partial<ProductStore>): Promise<ProductStore[]>;
    updateProductStore(id: string, data: Partial<ProductStore>): Promise<ProductStore>;
    deleteProductStore(id: string): Promise<ProductStore>;
}