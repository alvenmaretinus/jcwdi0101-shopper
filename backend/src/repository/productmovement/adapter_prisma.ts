import { PrismaClient } from "../../../prisma/generated/client";
import { CreateProductMovementReq, GetProductMovementReq, ProductMovement } from "./entities";
import { ProductMovementRepo } from "./interface";
import { v4 } from "uuid";

class PrismaRepository implements ProductMovementRepo {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }
    async createProductMovement(data: CreateProductMovementReq, tx?: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">): Promise<ProductMovement> {
        const client = tx ?? this.prisma;
        return client.productMovement.create({
            data: {
                id: v4(),
                ...data,
            },
        });
    }
    async getProductMovementsByFilter(filter: Partial<GetProductMovementReq>): Promise<ProductMovement[]> {
        return this.prisma.productMovement.findMany({
            where: filter,
        });
    }
}

export { PrismaRepository };