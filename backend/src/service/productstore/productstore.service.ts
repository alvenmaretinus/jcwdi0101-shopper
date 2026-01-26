import { MovementType } from "../../../prisma/generated/enums";
import { ProductMovementReq } from "../../repository/productmovement/entities";
import { Service } from "./interface";
import { ProductStoreRepo} from "../../repository/productstore/interface";
import { CreateProductStoreInput } from "../../schema/productstore/CreateProductStoreSchema";
import { ProductMovementRepo } from "../../repository/productmovement/interface";
import { ProductsRepo } from "../../repository/product/interface";
import { StoreRepository } from "../../repository/store.repository";
import { GetProductStoresByFilterInput, UpdateProductStoreInput } from "../../schema/productstore";
import { ProductStore } from "../../repository/productstore/entities";

class ProductStoreService implements Service {
    private productStoreRepo: ProductStoreRepo;
    private productMovementRepo: ProductMovementRepo;

    constructor(productStoreRepo: ProductStoreRepo, productMovementRepo: ProductMovementRepo) {
        this.productStoreRepo = productStoreRepo;
        this.productMovementRepo = productMovementRepo;
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
        const oldData = await this.productStoreRepo.getProductStoreByID(id);
        const ret = await this.productStoreRepo.updateProductStore(id, data);
        
        const deltaQuantity = ret.quantity - (oldData ? oldData.quantity : 0)
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
        await this.productMovementRepo.createProductMovement(movementData);
        return ret;
    }
    async deleteProductStore(id: string): Promise<void> {
        const ret = await this.productStoreRepo.deleteProductStore(id);

        const movementData: ProductMovementReq = {
            quantityChange: -ret.quantity,
            movementType: MovementType.ADJUSTMENT,
            productId: ret.productId,
            orderId: null,
            description: "Update movement on product store deletion",
        }
        await this.productMovementRepo.createProductMovement(movementData);
    }
}

export { ProductStoreService };