import { MovementType } from "../../../prisma/generated/enums";
import { ProductMovementRepo } from "../../repository/productmovement/interface";
import { CreateProductMovementInput } from "../../schema/productmovement";
import { Service } from "../productmovement/interface";
import { ProductMovement, ProductMovementReq } from "../../repository/productmovement/entities";

class ProductMovementService implements Service {
    private productMovementRepo!: ProductMovementRepo;

    constructor(productMovementRepo: ProductMovementRepo) {
        this.productMovementRepo = productMovementRepo;
    }

    async createProductMovement(data: CreateProductMovementInput): Promise<ProductMovement> {
        // TODO: modify this function when Stock Report is merged with the changes to the DB schema
        const inputData: ProductMovementReq = {
            ...data,
            movementType: data.movementType as MovementType,
            orderId: data.orderId || null,
            description: data.description || null,
            fromStoreId: data.fromStoreId || null,
            toStoreId: data.toStoreId || null,
        }
        return this.productMovementRepo.createProductMovement(inputData);
    }
    async getProductMovementsByFilter(filter: Partial<ProductMovement>): Promise<ProductMovement[]> {
        return this.productMovementRepo.getProductMovementsByFilter(filter);
    }
}

export { ProductMovementService };