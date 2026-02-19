import { Prisma, PrismaClient } from "../../../prisma/generated/client";
import { ProductStoreCreateInput as PrismaProductStoreCreateInput, ProductStoreUpdateInput as PrismaProductStoreUpdateInput } from "../../../prisma/generated/models";
import { NotFoundError } from "../../error/NotFoundError";
import { ProductStoreCreateInput, ProductStoreUpdateInput, ProductStoreGetInput, ProductStore } from "./entities";
import { ProductStoreRepo } from "./interface";


export class PrismaRepository implements ProductStoreRepo {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    private getClient(tx?: PrismaClient | Prisma.TransactionClient) {
        return tx ?? this.prisma;
    }

    private getRelationsInclude() {
        return {
            product: { select: { name: true } },
            store: { select: { name: true } },
        };
    }

    private toProductStoreResponse(productStore: any): ProductStore {
        return { ...productStore, productName: productStore.product.name, storeName: productStore.store.name };
    }

    private buildCreateData(data: ProductStoreCreateInput): PrismaProductStoreCreateInput {
        const now = new Date();
        return {
            quantity: data.quantity,
            createdAt: now,
            updatedAt: now,
            product: { connect: { id: data.productId } },
            store: { connect: { id: data.storeId } },
        };
    }

    private buildUpdateData(data: ProductStoreUpdateInput): Partial<PrismaProductStoreUpdateInput> {
        return { ...(data.quantity !== undefined ? { quantity: data.quantity } : {}), updatedAt: new Date() };
    }

    async createProductStore(data: ProductStoreCreateInput, tx?: PrismaClient | Prisma.TransactionClient): Promise<ProductStore> {
        const client = this.getClient(tx);
        const createdProductStore = await client.productStore.create({
            data: this.buildCreateData(data),
            include: this.getRelationsInclude(),
        });
        return this.toProductStoreResponse(createdProductStore);
    }

    async getProductStoreByID(id: string, tx?: PrismaClient | Prisma.TransactionClient): Promise<ProductStore | null> {
        const client = this.getClient(tx);
        const productStore = await client.productStore.findUnique({
            where: { id },
            include: this.getRelationsInclude(),
        });
        if (!productStore) return null;
        return this.toProductStoreResponse(productStore);
    }  

    async getProductStoresByFilter(filter: Partial<ProductStoreGetInput>, tx?: PrismaClient | Prisma.TransactionClient): Promise<ProductStore[]> {
        const client = this.getClient(tx);
        const productStores = await client.productStore.findMany({
            where: filter,
            include: this.getRelationsInclude(),
        });
        return productStores.map((ps) => this.toProductStoreResponse(ps));
    }

    async updateProductStore(id: string, data: ProductStoreUpdateInput, tx?: PrismaClient | Prisma.TransactionClient): Promise<ProductStore> {
        const client = this.getClient(tx);
        const updatedProductStore = await client.productStore.update({
            where: { id },
            data: this.buildUpdateData(data),
            include: this.getRelationsInclude(),
        });
        return this.toProductStoreResponse(updatedProductStore);
    }

    async deleteProductStore(id: string, tx?: PrismaClient | Prisma.TransactionClient): Promise<ProductStore> {
        const client = this.getClient(tx);
        const data = await client.productStore.findUnique({
            where: { id },
        });
        if (!data) {
            throw new NotFoundError(`ProductStore with id ${id} not found`);
        }
        
        await client.productStore.delete({
            where: { id },
        });
        return data;
    }
}