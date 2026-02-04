import { MovementType } from "../../../prisma/generated/enums";
import { ProductMovementRepo } from "../../repository/productmovement/interface";
import { CreateProductMovementInput, GetProductMovementsByFilterInput } from "../../schema/productmovement";
import { Service } from "../productmovement/interface";
import { ProductMovement, CreateProductMovementReq } from "../../repository/productmovement/entities";

export class ProductMovementService implements Service {
    private productMovementRepo: ProductMovementRepo;

    constructor(productMovementRepo: ProductMovementRepo) {
        this.productMovementRepo = productMovementRepo;
    }

    async createProductMovement(data: CreateProductMovementInput): Promise<ProductMovement> {
        const inputData: CreateProductMovementReq = {
            ...data,
            movementType: data.movementType as MovementType,
            orderId: data.orderId || null,
            description: data.description || null,
            fromStoreId: data.fromStoreId || null,
            toStoreId: data.toStoreId || null,
        }
        return this.productMovementRepo.createProductMovement(inputData);
    }
    async getProductMovementsByFilter(filter: GetProductMovementsByFilterInput): Promise<ProductMovement[]> {
        return this.productMovementRepo.getProductMovementsByFilter(filter);
    }
}