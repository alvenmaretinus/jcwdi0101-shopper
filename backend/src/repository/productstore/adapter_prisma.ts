import { PrismaClient } from "../../../prisma/generated/client";
import { ProductStoreCreateInput, ProductStoreUpdateInput } from "../../../prisma/generated/models";
import { NotFoundError } from "../../error/NotFoundError";
import { ProductStoreReq, ProductStore } from "./entities";
import { ProductStoreRepo } from "./interface";


export class PrismaRepository implements ProductStoreRepo {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async createProductStore(data: ProductStoreReq, tx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">): Promise<ProductStore> {
        const client = tx ?? this.prisma;
        const now: Date = new Date();
        const productStoreData: ProductStoreCreateInput = {
            quantity: data.quantity,
            createdAt: now,
            updatedAt: now,
            product: { connect: { id: data.productId } },
            store: { connect: { id: data.storeId } },
        }
        const createdProductStore = await client.productStore.create({
            data: productStoreData,
        });
        return createdProductStore;
    }
    async getProductStoreByID(id: string, tx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">): Promise<ProductStore | null> {
        const client = tx ?? this.prisma;
        const productStore = await client.productStore.findUnique({
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
    async updateProductStore(id: string, data: Partial<ProductStore>, tx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">): Promise<ProductStore> {
        const client = tx ?? this.prisma;
        const productStoreData: Partial<ProductStoreUpdateInput> = {
            ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
            updatedAt: new Date(),
            ...(data.productId !== undefined ? { product: { connect: { id: data.productId } } } : {}),
            ...(data.storeId !== undefined ? { store: { connect: { id: data.storeId } } } : {}),
        }
        const updatedProductStore = await client.productStore.update({
            where: { id: id },
            data: productStoreData,
        });
        return updatedProductStore;
    }

    async deleteProductStore(id: string, tx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">): Promise<ProductStore> {
        const client = tx ?? this.prisma;
        const data = await client.productStore.findUnique({
            where: { id: id },
        });
        if (!data) {
            throw new NotFoundError(`ProductStore with id ${id} not found`);
        }
        
        await client.productStore.delete({
            where: { id: id },
        });
        return data;
    }
}