import { CreateProductMovementReq,  ProductMovement } from "./entities";
import { Prisma } from "../../../prisma/generated/client";

export interface ProductMovementRepo {
    createProductMovement(data: CreateProductMovementReq, tx?: Prisma.TransactionClient): Promise<ProductMovement>;
    getProductMovementsByFilter(filter: Partial<CreateProductMovementReq>): Promise<ProductMovement[]>;
}