import { PrismaClient, ProductMovement } from "../../../prisma/generated/client";
import { ProductMovementReq } from "./entities";
import { ProductMovementRepo } from "./interface";
import { v4 }from "uuid";

class PrismaRepository implements ProductMovementRepo {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }
    // TODO: Define Mapper from prisma type to our type
    async createProductMovement(data: ProductMovementReq): Promise<ProductMovement> {
        return this.prisma.productMovement.create({
            data: {
                id: v4(),
                ...data,
                productName: '',
                productCategory: '',
            },
        });
    }
    async getProductMovementsByFilter(filter: Partial<ProductMovementReq>): Promise<ProductMovement[]> {
        return this.prisma.productMovement.findMany({
            where: filter,
        });
    }
}

export { PrismaRepository };