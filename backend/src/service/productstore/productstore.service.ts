import { MovementType } from "../../../prisma/generated/enums";
import { ProductMovementReq } from "../../repository/productmovement/entities";
import { Service } from "./interface";
import { ProductStoreRepo} from "../../repository/productstore/interface";
import { CreateProductStoreInput } from "../../schema/productstore/CreateProductStoreSchema";
import { ProductMovementRepo } from "../../repository/productmovement/interface";
import { GetProductStoresByFilterInput, UpdateProductStoreInput } from "../../schema/productstore";
import { ProductStore } from "../../repository/productstore/entities";
import { PrismaClient } from "../../../prisma/generated/client";
import { DefaultArgs } from "@prisma/client/runtime/client";

class ProductStoreService implements Service {
    private productStoreRepo: ProductStoreRepo;
    private productMovementRepo: ProductMovementRepo;
    private prisma: PrismaClient;

    constructor(productStoreRepo: ProductStoreRepo, productMovementRepo: ProductMovementRepo, prisma: PrismaClient) {
        this.productStoreRepo = productStoreRepo;
        this.productMovementRepo = productMovementRepo;
        this.prisma = prisma;
    }
    async createProductStore(data: CreateProductStoreInput): Promise<ProductStore> {
        const productStore = await this.productStoreRepo.createProductStore(data);

        const movementData: ProductMovementReq = {
            quantityChange: data.quantity,
            movementType: MovementType.ADJUSTMENT,
            productId: data.productId,
            orderId: null,
            description: "Initial stock added on product store creation",
        }
        await this.productMovementRepo.createProductMovement(movementData);
        return productStore;
    }

    async getProductStoreByID(id: string): Promise<ProductStore | null> {
        return this.productStoreRepo.getProductStoreByID(id);
    }
    async getProductStoresByFilter(filter: Partial<GetProductStoresByFilterInput>): Promise<ProductStore[]> {
        return this.productStoreRepo.getProductStoresByFilter(filter);
    }

    async updateProductStore(id: string, data: Partial<UpdateProductStoreInput>): Promise<ProductStore> {
        return await this.prisma.$transaction(async (
            tx: Omit<PrismaClient<never, undefined, DefaultArgs>,
             "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">) => {
            const oldData: ProductStore | null = await this.productStoreRepo.getProductStoreByID(id);
            if (oldData == null) {
                throw new Error(`ProductStore with id ${id} not found`);
            }
            const ret: ProductStore = await this.productStoreRepo.updateProductStore(id, data);
            
            const deltaQuantity = ret.quantity - oldData.quantity;
            if (deltaQuantity === 0) {
                return ret;
            }

            const movementData: ProductMovementReq = {
                quantityChange: deltaQuantity,
                movementType: MovementType.ADJUSTMENT,
                productId: ret.productId,
                orderId: null,
                description: "Update movement on product store update",
            }
            await this.productMovementRepo.createProductMovement(movementData, tx);
            return ret;
        });
    }
    async deleteProductStore(id: string): Promise<void> {
        await this.prisma.$transaction(async (
            tx: Omit<PrismaClient<never, undefined, DefaultArgs>,
             "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends">) => {
            const ret = await this.productStoreRepo.deleteProductStore(id, tx);

            const movementData: ProductMovementReq = {
                quantityChange: -ret.quantity,
                movementType: MovementType.ADJUSTMENT,
                productId: ret.productId,
                orderId: null,
                description: "Update movement on product store deletion",
            }
            await this.productMovementRepo.createProductMovement(movementData, tx);
        });
    }
}

export { ProductStoreService };