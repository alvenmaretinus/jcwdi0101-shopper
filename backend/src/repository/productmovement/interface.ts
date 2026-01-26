
import { ProductMovementReq,  ProductMovement } from "./entities";

export interface ProductMovementRepo {
    createProductMovement(data: ProductMovementReq): Promise<ProductMovement>;
    getProductMovementsByFilter(filter: Partial<ProductMovementReq>): Promise<ProductMovement[]>;
}