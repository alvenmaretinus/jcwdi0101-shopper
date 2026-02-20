import { ProductStore, ProductStoreCreateInput, ProductStoreUpdateInput, ProductStoreGetInput } from "./entities";
import { Prisma, PrismaClient } from "../../../prisma/generated/client";

export interface ProductStoreRepo {
    createProductStore(data: ProductStoreCreateInput, tx?: PrismaClient | Prisma.TransactionClient): Promise<ProductStore>;
    getProductStoreByID(id: string, tx?: PrismaClient | Prisma.TransactionClient): Promise<ProductStore | null>;
    getProductStoresByFilter(filter: Partial<ProductStoreGetInput>, tx?: PrismaClient | Prisma.TransactionClient): Promise<ProductStore[]>;
    updateProductStore(id: string, data: ProductStoreUpdateInput, tx?: PrismaClient | Prisma.TransactionClient): Promise<ProductStore>;
    deleteProductStore(id: string, tx?: PrismaClient | Prisma.TransactionClient): Promise<ProductStore>;
}