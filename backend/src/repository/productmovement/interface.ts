import { ProductMovementReq,  ProductMovement } from "./entities";
import { PrismaClient } from "../../../prisma/generated/client";

export interface ProductMovementRepo {
    createProductMovement(data: ProductMovementReq, tx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">): Promise<ProductMovement>;
    getProductMovementsByFilter(filter: Partial<ProductMovementReq>): Promise<ProductMovement[]>;
}