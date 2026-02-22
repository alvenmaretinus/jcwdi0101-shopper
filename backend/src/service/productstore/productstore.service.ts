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
import { PRODUCT_MOVEMENT_DEFAULTS } from "../../lib/config/productMovementDefaults";

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
        return await this.prisma.$transaction(async (tx) => {
            const productStore = await this.productStoreRepo.createProductStore(data, tx);
            
            // Create initial stock movement if quantity > 0
            if (data.quantity === 0) {
                return productStore;
            }
            
            const movementData: CreateProductMovementReq = {
                quantityChange: data.quantity,
                movementType: data.movementType ? data.movementType as MovementType : PRODUCT_MOVEMENT_DEFAULTS.CREATE.movementType,
                productId: data.productId,
                orderId: null,
                description: data.movementMessage || PRODUCT_MOVEMENT_DEFAULTS.CREATE.message,
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
    async getProductStoresByFilter(filter: GetProductStoresByFilterInput, tx?: Prisma.TransactionClient): Promise<ProductStore[]> {
        return this.productStoreRepo.getProductStoresByFilter(filter, tx);
    }

    async updateProductStore(data: UpdateProductStoreInput): Promise<ProductStore> {
        const {id, fromStoreId, toStoreId, transferQuantity, movementMessage, movementType, ...rest} = data;
        
        return await this.prisma.$transaction(async (tx) => {
            
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

                // Fetch store names for the movement description
                const fromStore = await tx.store.findUnique({
                    where: { id: fromStoreId },
                    select: { name: true },
                });
                const toStore = await tx.store.findUnique({
                    where: { id: toStoreId },
                    select: { name: true },
                });

                // Create product movement record for reallocation with store names
                const movementData: CreateProductMovementReq = {
                    quantityChange: transferQuantity,
                    movementType: movementType ? movementType as MovementType : PRODUCT_MOVEMENT_DEFAULTS.REALLOCATE.movementType,
                    productId: currentProductStore.productId,
                    orderId: null,
                    description: movementMessage || `Stock reallocated from store ${fromStore?.name} (${fromStoreId}) to store ${toStore?.name} (${toStoreId})`,
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
                movementType: movementType ? movementType as MovementType : PRODUCT_MOVEMENT_DEFAULTS.UPDATE.movementType,
                productId: ret.productId,
                orderId: null,
                description: movementMessage || PRODUCT_MOVEMENT_DEFAULTS.UPDATE.message,
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
                movementType: PRODUCT_MOVEMENT_DEFAULTS.DELETE.movementType,
                productId: ret.productId,
                orderId: null,
                description: PRODUCT_MOVEMENT_DEFAULTS.DELETE.message,
                fromStoreId: ret.storeId,
                toStoreId: null,
            }
            await this.productMovementRepo.createProductMovement(movementData, tx);
        });
    }
}