import { PrismaClient } from "../../../prisma/generated/client";
import { ProductMovementRepo } from "./interface";

class PrismaRepository implements ProductMovementRepo {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }
    // TODO: Define proper data types instead of any and add linkings to products
    async createProductMovement(data: any): Promise<any> {
        return this.prisma.productMovement.create({
            data,
        });
    }
    async getProductMovementsByFilter(filter: Partial<any>): Promise<any[]> {
        return this.prisma.productMovement.findMany({
            where: filter,
        });
    }
}

export { PrismaRepository };