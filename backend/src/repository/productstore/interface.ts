import { ProductStore, ProductStoreCreateInput, ProductStoreUpdateInput, ProductStoreGetInput } from "./entities";
import { Prisma } from "../../../prisma/generated/client";

export interface ProductStoreRepo {
    createProductStore(data: ProductStoreCreateInput, tx?: Prisma.TransactionClient): Promise<ProductStore>;
    getProductStoreByID(id: string, tx?: Prisma.TransactionClient): Promise<ProductStore | null>;
    getProductStoresByFilter(filter: Partial<ProductStoreGetInput>): Promise<ProductStore[]>;
    updateProductStore(id: string, data: ProductStoreUpdateInput, tx?: Prisma.TransactionClient): Promise<ProductStore>;
    deleteProductStore(id: string, tx?: Prisma.TransactionClient): Promise<ProductStore>;
}