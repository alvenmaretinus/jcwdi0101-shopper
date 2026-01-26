import { CreateProductMovementInput } from "../../schema/productmovement";

interface ProductMovementService {
    createProductMovement(data: CreateProductMovementInput): Promise<any>;
    getProductMovementsByFilter(filter: Partial<any>): Promise<any[]>;
}

export type Service = ProductMovementService;