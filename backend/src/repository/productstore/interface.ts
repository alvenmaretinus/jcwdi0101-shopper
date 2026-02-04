import { ProductStore, ProductStoreReq } from "./entities";
import { PrismaClient } from "../../../prisma/generated/client";

export interface ProductStoreRepo {
    createProductStore(data: ProductStoreReq, tx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">): Promise<ProductStore>;
    getProductStoreByID(id: string, tx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">): Promise<ProductStore | null>;
    getProductStoresByFilter(filter: Partial<ProductStore>): Promise<ProductStore[]>;
    updateProductStore(id: string, data: Partial<ProductStore>, tx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">): Promise<ProductStore>;
    deleteProductStore(id: string, tx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">): Promise<ProductStore>;
}