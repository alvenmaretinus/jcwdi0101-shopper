import { MovementType } from "../../../prisma/generated/enums";
import { CreateProductMovementReq } from "../../repository/productmovement/entities";
import { Service } from "./interface";
import { ProductStoreRepo } from "../../repository/productstore/interface";
import { CreateProductStoreInput } from "../../schema/productstore/CreateProductStoreSchema";
import { ProductMovementRepo } from "../../repository/productmovement/interface";
import { GetProductStoresByFilterInput, UpdateProductStoreInput } from "../../schema/productstore";
import { ProductStore } from "../../repository/productstore/entities";
import { Prisma, PrismaClient } from "../../../prisma/generated/client";
import { NotFoundError } from "../../error/NotFoundError";

export class ProductStoreService implements Service {
    private productStoreRepo: ProductStoreRepo;
    private productMovementRepo: ProductMovementRepo;
    private prisma: PrismaClient;

    constructor(productStoreRepo: ProductStoreRepo, productMovementRepo: ProductMovementRepo, prisma: PrismaClient) {
        this.productStoreRepo = productStoreRepo;
        this.productMovementRepo = productMovementRepo;
        this.prisma = prisma;
    }

    private async recordInitialStockMovement(data: CreateProductStoreInput, tx: Prisma.TransactionClient): Promise<void> {
        if (data.quantity === 0) return;
        const movementData: CreateProductMovementReq = {
            quantityChange: data.quantity, movementType: MovementType.ADJUSTMENT, productId: data.productId,
            orderId: null, description: "Initial stock added on product store creation", fromStoreId: null, toStoreId: data.storeId,
        };
        await this.productMovementRepo.createProductMovement(movementData, tx);
    }

    private async createProductStoreTx(data: CreateProductStoreInput, tx: Prisma.TransactionClient): Promise<ProductStore> {
        const productStore = await this.productStoreRepo.createProductStore(data, tx);
        await this.recordInitialStockMovement(data, tx);
        return productStore;
    }

    async createProductStore(data: CreateProductStoreInput): Promise<ProductStore> {
        return this.prisma.$transaction((tx) => this.createProductStoreTx(data, tx));
    }

    async getProductStoreByID(id: string): Promise<ProductStore | null> {
        return this.productStoreRepo.getProductStoreByID(id);
    }

    async getProductStoresByFilter(filter: GetProductStoresByFilterInput, tx?: Prisma.TransactionClient): Promise<ProductStore[]> {
        return this.productStoreRepo.getProductStoresByFilter(filter, tx);
    }

    private async getProductStoreOrThrow(id: string, tx: Prisma.TransactionClient): Promise<ProductStore> {
        const productStore = await this.productStoreRepo.getProductStoreByID(id, tx);
        if (!productStore) throw new NotFoundError(`ProductStore with id ${id} not found`);
        return productStore;
    }

    private async getStoreProductOrThrow(productId: string, storeId: string, tx: Prisma.TransactionClient): Promise<ProductStore> {
        const storeProducts = await this.productStoreRepo.getProductStoresByFilter({ productId, storeId }, tx);
        const productStore = storeProducts[0];
        if (!productStore) throw new NotFoundError("Product not found in source store");
        return productStore;
    }

    private async getOrCreateDestinationProduct(
        productId: string,
        storeId: string,
        tx: Prisma.TransactionClient
    ): Promise<ProductStore> {
        const toStoreProducts = await this.productStoreRepo.getProductStoresByFilter({ productId, storeId }, tx);
        if (toStoreProducts[0]) return toStoreProducts[0];
        return this.productStoreRepo.createProductStore({ productId, storeId, quantity: 0 }, tx);
    }

    private ensureEnoughStock(currentQuantity: number, transferQuantity: number): void {
        if (currentQuantity >= transferQuantity) return;
        throw new Error(`Insufficient stock in source store. Available: ${currentQuantity}, Requested: ${transferQuantity}`);
    }

    private async createReallocationMovement(
        productId: string,
        transferQuantity: number,
        fromStoreId: string,
        toStoreId: string,
        tx: Prisma.TransactionClient
    ): Promise<void> {
        const movementData: CreateProductMovementReq = {
            quantityChange: transferQuantity, movementType: MovementType.REALLOCATED, productId,
            orderId: null, description: `Stock reallocated from store ${fromStoreId} to store ${toStoreId}`,
            fromStoreId, toStoreId,
        };
        await this.productMovementRepo.createProductMovement(movementData, tx);
    }

    private async applyTransferQuantityUpdates(
        fromProductStore: ProductStore,
        toProductStore: ProductStore,
        transferQuantity: number,
        tx: Prisma.TransactionClient
    ): Promise<ProductStore> {
        await this.productStoreRepo.updateProductStore(fromProductStore.id, { quantity: fromProductStore.quantity - transferQuantity }, tx);
        return this.productStoreRepo.updateProductStore(toProductStore.id, { quantity: toProductStore.quantity + transferQuantity }, tx);
    }

    private async transferStock(id: string, fromStoreId: string, toStoreId: string, transferQuantity: number, tx: Prisma.TransactionClient): Promise<ProductStore> {
        const currentProductStore = await this.getProductStoreOrThrow(id, tx);
        const fromProductStore = await this.getStoreProductOrThrow(currentProductStore.productId, fromStoreId, tx);
        this.ensureEnoughStock(fromProductStore.quantity, transferQuantity);
        const toProductStore = await this.getOrCreateDestinationProduct(currentProductStore.productId, toStoreId, tx);
        const updatedToStore = await this.applyTransferQuantityUpdates(fromProductStore, toProductStore, transferQuantity, tx);
        await this.createReallocationMovement(currentProductStore.productId, transferQuantity, fromStoreId, toStoreId, tx);
        if (fromProductStore.id !== id) return updatedToStore;
        return this.productStoreRepo.getProductStoreByID(id, tx) as Promise<ProductStore>;
    }

    private async createAdjustmentMovement(oldData: ProductStore, ret: ProductStore, tx: Prisma.TransactionClient): Promise<void> {
        const deltaQuantity = ret.quantity - oldData.quantity;
        if (deltaQuantity === 0) return;
        const movementData: CreateProductMovementReq = {
            quantityChange: deltaQuantity, movementType: MovementType.ADJUSTMENT, productId: ret.productId,
            orderId: null, description: "Stock adjustment recorded on product store update",
            fromStoreId: deltaQuantity < 0 ? ret.storeId : null, toStoreId: deltaQuantity > 0 ? ret.storeId : null,
        };
        await this.productMovementRepo.createProductMovement(movementData, tx);
    }

    private async adjustStock(id: string, rest: Partial<UpdateProductStoreInput>, tx: Prisma.TransactionClient): Promise<ProductStore> {
        const oldData = await this.getProductStoreOrThrow(id, tx);
        const ret = await this.productStoreRepo.updateProductStore(id, rest, tx);
        await this.createAdjustmentMovement(oldData, ret, tx);
        return ret;
    }

    private async updateProductStoreTx(data: UpdateProductStoreInput, tx: Prisma.TransactionClient): Promise<ProductStore> {
        const { id, fromStoreId, toStoreId, transferQuantity, ...rest } = data;
        if (fromStoreId && toStoreId && transferQuantity) return this.transferStock(id, fromStoreId, toStoreId, transferQuantity, tx);
        return this.adjustStock(id, rest, tx);
    }

    async updateProductStore(data: UpdateProductStoreInput): Promise<ProductStore> {
        return this.prisma.$transaction((tx) => this.updateProductStoreTx(data, tx));
    }

    private async deleteProductStoreTx(id: string, tx: Prisma.TransactionClient): Promise<void> {
        const ret = await this.productStoreRepo.deleteProductStore(id, tx);
        if (ret.quantity === 0) return;
        const movementData: CreateProductMovementReq = {
            quantityChange: -ret.quantity, movementType: MovementType.ADJUSTMENT, productId: ret.productId,
            orderId: null, description: "Stock removed on product store deletion", fromStoreId: ret.storeId, toStoreId: null,
        };
        await this.productMovementRepo.createProductMovement(movementData, tx);
    }

    async deleteProductStore(id: string): Promise<void> {
        await this.prisma.$transaction((tx) => this.deleteProductStoreTx(id, tx));
    }
}