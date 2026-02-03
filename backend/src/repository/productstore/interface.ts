import { ProductStore, ProductStoreReq } from "./entities";
import { PrismaClient } from "../../../prisma/generated/client";

export interface ProductStoreRepo {
    createProductStore(data: ProductStoreReq): Promise<ProductStore>;
    getProductStoreByID(id: string): Promise<ProductStore | null>;
    getProductStoresByFilter(filter: Partial<ProductStore>): Promise<ProductStore[]>;
    updateProductStore(id: string, data: Partial<ProductStore>): Promise<ProductStore>;
    deleteProductStore(id: string, tx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">): Promise<ProductStore>;
}