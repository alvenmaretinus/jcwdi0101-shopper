import { ProductsRepo } from './interface';
import { PrismaClient } from '../../../prisma/generated/client';
import { Product, ProductReq, ProductWithStock } from './entities';


export class PrismaRepository implements ProductsRepo {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async getProductsByFilter(filter: Partial<ProductReq>): Promise<Product[]> {  
        const products = await this.prisma.product.findMany({
            where: filter,
        });
        return products;
    }

    async getProductsByFilterWithStock(filter: Partial<ProductReq>): Promise<ProductWithStock[]> {  
        const products: ProductWithStock[] = await this.prisma.product.findMany({
            where: filter,
            include: {
                productStores: true,
            },
        });
        return products;
    }
}