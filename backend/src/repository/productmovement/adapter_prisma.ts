import { Prisma, PrismaClient } from "../../../prisma/generated/client";
import { CreateProductMovementReq, GetProductMovementReq, ProductMovement } from "./entities";
import { ProductMovementRepo } from "./interface";

class PrismaRepository implements ProductMovementRepo {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }
    async createProductMovement(data: CreateProductMovementReq, tx?: Prisma.TransactionClient): Promise<ProductMovement> {
        const client = tx ?? this.prisma;
        return client.productMovement.create({
            data: {
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