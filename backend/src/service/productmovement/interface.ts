import { ProductMovement } from "../../repository/productmovement/entities";
import { CreateProductMovementInput } from "../../schema/productmovement";

interface ProductMovementService {
    createProductMovement(data: CreateProductMovementInput): Promise<any>;
    getProductMovementsByFilter(filter: Partial<ProductMovement>): Promise<any[]>;
}

export type Service = ProductMovementService;