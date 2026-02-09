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
    async createProductStore(data: CreateProductStoreInput): Promise<ProductStore> {
        return await this.prisma.$transaction(async (
            tx: Prisma.TransactionClient) => {
            const productStore = await this.productStoreRepo.createProductStore(data, tx);
            
            // Create initial stock movement if quantity > 0
            if (data.quantity === 0) {
                return productStore;
            }
            
            const movementData: CreateProductMovementReq = {
                quantityChange: data.quantity,
                movementType: MovementType.ADJUSTMENT,
                productId: data.productId,
                orderId: null,
                description: "Initial stock added on product store creation",
                fromStoreId: null,
                toStoreId: data.storeId,
            }
            await this.productMovementRepo.createProductMovement(movementData, tx);
            return productStore;
        });
    }

    async getProductStoreByID(id: string): Promise<ProductStore | null> {
        return this.productStoreRepo.getProductStoreByID(id);
    }
    async getProductStoresByFilter(filter: GetProductStoresByFilterInput): Promise<ProductStore[]> {
        return this.productStoreRepo.getProductStoresByFilter(filter);
    }

    async updateProductStore(data: UpdateProductStoreInput): Promise<ProductStore> {
        const {id, fromStoreId, toStoreId, transferQuantity, ...rest} = data;
        
        return await this.prisma.$transaction(async (
            tx: Prisma.TransactionClient) => {
            
            // Handle store-to-store transfer
            if (fromStoreId && toStoreId && transferQuantity) {
                // Get the current product store record
                const currentProductStore: ProductStore | null = await this.productStoreRepo.getProductStoreByID(id, tx);
                if (currentProductStore == null) {
                    throw new NotFoundError(`ProductStore with id ${id} not found`);
                }

                // Find the from store's product store record
                const fromStoreProducts = await this.productStoreRepo.getProductStoresByFilter(
                    { productId: currentProductStore.productId, storeId: fromStoreId },
                    tx
                );
                const fromProductStore = fromStoreProducts[0];
                if (!fromProductStore) {
                    throw new NotFoundError(`Product not found in source store`);
                }
                if (fromProductStore.quantity < transferQuantity) {
                    throw new Error(`Insufficient stock in source store. Available: ${fromProductStore.quantity}, Requested: ${transferQuantity}`);
                }

                // Find or get the to store's product store record
                const toStoreProducts = await this.productStoreRepo.getProductStoresByFilter(
                    { productId: currentProductStore.productId, storeId: toStoreId },
                    tx
                );
                let toProductStore = toStoreProducts[0];
                
                // If destination store doesn't have this product, create it
                if (!toProductStore) {
                    toProductStore = await this.productStoreRepo.createProductStore(
                        {
                            productId: currentProductStore.productId,
                            storeId: toStoreId,
                            quantity: 0
                        },
                        tx
                    );
                }

                // Update quantities
                await this.productStoreRepo.updateProductStore(
                    fromProductStore.id,
                    { quantity: fromProductStore.quantity - transferQuantity },
                    tx
                );
                const updatedToStore = await this.productStoreRepo.updateProductStore(
                    toProductStore.id,
                    { quantity: toProductStore.quantity + transferQuantity },
                    tx
                );

                // Create product movement record for reallocation
                const movementData: CreateProductMovementReq = {
                    quantityChange: transferQuantity,
                    movementType: MovementType.REALLOCATED,
                    productId: currentProductStore.productId,
                    orderId: null,
                    description: `Stock reallocated from store ${fromStoreId} to store ${toStoreId}`,
                    fromStoreId: fromStoreId,
                    toStoreId: toStoreId,
                };
                await this.productMovementRepo.createProductMovement(movementData, tx);

                // Return the updated "from" store record if it matches the id, otherwise return "to" store
                if (fromProductStore.id === id) {
                    return await this.productStoreRepo.getProductStoreByID(id, tx) as ProductStore;
                }
                return updatedToStore;
            }

            // Handle regular quantity adjustment
            const oldData: ProductStore | null = await this.productStoreRepo.getProductStoreByID(id, tx);
            if (oldData == null) {
                throw new NotFoundError(`ProductStore with id ${id} not found`);
            }
            
            const ret: ProductStore = await this.productStoreRepo.updateProductStore(id, rest, tx);
            
            const deltaQuantity = ret.quantity - oldData.quantity;
            if (deltaQuantity === 0) {
                return ret;
            }

            const movementData: CreateProductMovementReq = {
                quantityChange: deltaQuantity,
                movementType: MovementType.ADJUSTMENT,
                productId: ret.productId,
                orderId: null,
                description: "Stock adjustment recorded on product store update",
                fromStoreId: deltaQuantity < 0 ? ret.storeId : null,
                toStoreId: deltaQuantity > 0 ? ret.storeId : null,
            };
            await this.productMovementRepo.createProductMovement(movementData, tx);
            return ret;
        });
    }
    async deleteProductStore(id: string): Promise<void> {
        await this.prisma.$transaction(async (
            tx: Prisma.TransactionClient) => {
            const ret = await this.productStoreRepo.deleteProductStore(id, tx);

            if (ret.quantity === 0) {
                return;
            }

            const movementData: CreateProductMovementReq = {
                quantityChange: -ret.quantity,
                movementType: MovementType.ADJUSTMENT,
                productId: ret.productId,
                orderId: null,
                description: "Stock removed on product store deletion",
                fromStoreId: ret.storeId,
                toStoreId: null,
            }
            await this.productMovementRepo.createProductMovement(movementData, tx);
        });
    }
}