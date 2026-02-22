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
        
        // Determine which store to check for endStock
        // Priority: toStoreId (incoming) > fromStoreId (outgoing)
        const storeId = data.toStoreId || data.fromStoreId;
        
        let endStock = data.endStock;
        
        // If endStock not explicitly provided, get it from ProductStore
        if (endStock === undefined && storeId) {
            const productStore = await client.productStore.findFirst({
                where: {
                    productId: data.productId,
                    storeId: storeId,
                },
                select: { quantity: true },
            });
            
            // Use the ProductStore quantity as endStock (after the movement has been applied)
            endStock = productStore?.quantity || 0;
        }
        
        return client.productMovement.create({
            data: {
                ...data,
                endStock,
            },
        });
    }
    async getProductMovementsByFilter(
        filter: Partial<GetProductMovementReq>,
        tx?: Prisma.TransactionClient
    ): Promise<ProductMovement[]> {
        const client = tx ?? this.prisma;
        return client.productMovement.findMany({
            where: filter,
        });
    }
}

export { PrismaRepository };