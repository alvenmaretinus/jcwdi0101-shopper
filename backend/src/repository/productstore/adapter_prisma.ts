import { PrismaClient } from "../../../prisma/generated/client";
import { ProductStoreCreateInput, ProductStoreUpdateInput } from "../../../prisma/generated/models";
import { ProductStoreRepo } from "./interface";

export class ProductStoreRepository implements ProductStoreRepo {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async createProductStore(data: any): Promise<any> {
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
    async getProductStoreByID(id: string): Promise<any | null> {
        const productStore = await this.prisma.productStore.findUnique({
            where: { id: id },
        });
        return productStore;
    }  
    async getProductStoresByFilter(filter: Partial<any>): Promise<any[]> {
        const productStores = await this.prisma.productStore.findMany({
            where: filter,
        });
        return productStores;
    }
    async updateProductStore(id: string, data: Partial<any>): Promise<any> {
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
    async deleteProductStore(id: string): Promise<void> {
        await this.prisma.productStore.delete({
            where: { id: id },
        });
    }
}