import { ProductMovement } from "../../repository/productmovement/entities";
import { CreateProductMovementInput } from "../../schema/productmovement";

interface ProductMovementService {
    createProductMovement(data: CreateProductMovementInput): Promise<ProductMovement>;
    getProductMovementsByFilter(filter: Partial<ProductMovement>): Promise<ProductMovement[]>;
}

export type Service = ProductMovementService;