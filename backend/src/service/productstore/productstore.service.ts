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
        const {id, ...rest} = data;
        return await this.prisma.$transaction(async (
            tx: Prisma.TransactionClient) => {
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
            }
            await this.productMovementRepo.createProductMovement(movementData, tx);
            return ret;
        });
    }
    async deleteProductStore(id: string): Promise<void> {
        await this.prisma.$transaction(async (
            tx: Prisma.TransactionClient) => {
            const ret = await this.productStoreRepo.deleteProductStore(id, tx);

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