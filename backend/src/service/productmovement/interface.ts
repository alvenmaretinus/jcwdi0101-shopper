import { ProductMovement } from "../../repository/productmovement/entities";
import { CreateProductMovementInput, GetProductMovementsByFilterInput } from "../../schema/productmovement";

interface ProductMovementService {
    createProductMovement(data: CreateProductMovementInput): Promise<ProductMovement>;
    getProductMovementsByFilter(filter: GetProductMovementsByFilterInput): Promise<ProductMovement[]>;
}

export type Service = ProductMovementService;