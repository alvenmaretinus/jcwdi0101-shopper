import { PrismaClient } from "../../../prisma/generated/client";
import { ProductStoreCreateInput, ProductStoreUpdateInput } from "../../../prisma/generated/models";
import { ProductStoreReq, ProductStore } from "./entities";
import { ProductStoreRepo } from "./interface";


export class PrismaRepository implements ProductStoreRepo {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async createProductStore(data: ProductStoreReq): Promise<ProductStore> {
        const now: Date = new Date();
        const productStoreData: ProductStoreCreateInput = {
            quantity: data.quantity,
            createdAt: now,
            updatedAt: now,
            product: { connect: { id: data.productId } },
            store: { connect: { id: data.storeId } },
        }
        const createdProductStore = await this.prisma.productStore.create({
            data: productStoreData,
        });
        return createdProductStore;
    }
    async getProductStoreByID(id: string): Promise<ProductStore | null> {
        const productStore = await this.prisma.productStore.findUnique({
            where: { id: id },
        });
        return productStore;
    }  
    async getProductStoresByFilter(filter: Partial<ProductStore>): Promise<ProductStore[]> {
        const productStores = await this.prisma.productStore.findMany({
            where: filter,
        });
        return productStores;
    }
    async updateProductStore(id: string, data: Partial<ProductStore>): Promise<ProductStore> {
        const productStoreData: Partial<ProductStoreUpdateInput> = {
            ...data,
            updatedAt: new Date(),
            product: data.productId ? { connect: { id: data.productId } } : undefined,
            store: data.storeId ? { connect: { id: data.storeId } } : undefined,
        }
        const updatedProductStore = await this.prisma.productStore.update({
            where: { id: id },
            data: productStoreData,
        });
        return updatedProductStore;
    }
    async deleteProductStore(id: string): Promise<ProductStore> {
        const data = await this.getProductStoreByID(id);
        if (!data) {
            throw new Error(`ProductStore with id ${id} not found`);
        }
        await this.prisma.productStore.delete({
            where: { id: id },
        });
        return data;
    }
}