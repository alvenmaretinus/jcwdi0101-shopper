import { CreateProductMovementReq,  ProductMovement } from "./entities";
import { PrismaClient } from "../../../prisma/generated/client";

export interface ProductMovementRepo {
    createProductMovement(data: CreateProductMovementReq, tx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">): Promise<ProductMovement>;
    getProductMovementsByFilter(filter: Partial<CreateProductMovementReq>): Promise<ProductMovement[]>;
}