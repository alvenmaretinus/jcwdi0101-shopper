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

    async createProductStore(data: ProductStoreCreateInput, tx?: PrismaClient | Prisma.TransactionClient): Promise<ProductStore> {
        const client = tx ?? this.prisma;
        const now: Date = new Date();
        const productStoreData: PrismaProductStoreCreateInput = {
            quantity: data.quantity,
            createdAt: now,
            updatedAt: now,
            product: { connect: { id: data.productId } },
            store: { connect: { id: data.storeId } },
        }
        const createdProductStore = await client.productStore.create({
            data: productStoreData,
            include: {
                product: { select: { name: true } },
                store: { select: { name: true } }
            }
        });
        return {
            ...createdProductStore,
            productName: createdProductStore.product.name,
            storeName: createdProductStore.store.name
        };
    }
    async getProductStoreByID(id: string, tx?: PrismaClient | Prisma.TransactionClient): Promise<ProductStore | null> {
        const client = tx ?? this.prisma;
        const productStore = await client.productStore.findUnique({
            where: { id: id },
            include: {
                product: { select: { name: true } },
                store: { select: { name: true } }
            }
        });
        if (!productStore) return null;
        return {
            ...productStore,
            productName: productStore.product.name,
            storeName: productStore.store.name
        };
    }  
    async getProductStoresByFilter(filter: Partial<ProductStoreGetInput>, tx?: PrismaClient | Prisma.TransactionClient): Promise<ProductStore[]> {
        const client = tx ?? this.prisma;
        const productStores = await client.productStore.findMany({
            where: filter,
            include: {
                product: { select: { name: true } },
                store: { select: { name: true } }
            }
        });
        return productStores.map(ps => ({
            ...ps,
            productName: ps.product.name,
            storeName: ps.store.name
        }));
    }
    async updateProductStore(id: string, data: ProductStoreUpdateInput, tx?: PrismaClient | Prisma.TransactionClient): Promise<ProductStore> {
        const client = tx ?? this.prisma;
        const productStoreData: Partial<PrismaProductStoreUpdateInput> = {
            ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
            updatedAt: new Date(),
        }
        const updatedProductStore = await client.productStore.update({
            where: { id: id },
            data: productStoreData,
            include: {
                product: { select: { name: true } },
                store: { select: { name: true } }
            }
        });
        return {
            ...updatedProductStore,
            productName: updatedProductStore.product.name,
            storeName: updatedProductStore.store.name
        };
    }

    async deleteProductStore(id: string, tx?: PrismaClient | Prisma.TransactionClient): Promise<ProductStore> {
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