import { MovementType } from "../../../prisma/generated/browser";
import { ProductMovementRepo } from "../../repository/productmovement/interface";
import { CreateProductMovementInput } from "../../schema/productmovement";
import { Service } from "../productmovement/interface";
import { ProductMovement, ProductMovementReq } from "../../repository/productmovement/entities";

class ProductMovementService implements Service {
    private static Instance: ProductMovementService | undefined;
    private productMovementRepo!: ProductMovementRepo;

    constructor(productMovementRepo: ProductMovementRepo) {
        if (ProductMovementService.Instance) {
            return ProductMovementService.Instance;
        }
        this.productMovementRepo = productMovementRepo;
        ProductMovementService.Instance = this;
        return this;
    }
    async createProductMovement(data: CreateProductMovementInput): Promise<ProductMovement> {
        const inputData: ProductMovementReq = {
            ...data,
            movementType: data.movementType as MovementType,
            orderId: data.orderId || null,
            description: data.description || null,
            fromStoreName: data.fromStoreName || null,
            toStoreName: data.toStoreName || null
        }
        return this.productMovementRepo.createProductMovement(inputData);
    }
    async getProductMovementsByFilter(filter: Partial<ProductMovement>): Promise<ProductMovement[]> {
        return this.productMovementRepo.getProductMovementsByFilter(filter);
    }
}

export { ProductMovementService };