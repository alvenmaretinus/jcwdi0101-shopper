import { ProductsRepo } from './interface';
import { PrismaClient } from '../../../prisma/generated/client';
import { Product, ProductReq, ProductWithStock, ProductWhereClause } from './entities';


export class PrismaRepository implements ProductsRepo {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async getProductsByFilter(filter: Partial<ProductReq>): Promise<Product[]> {
        const where = this.buildWhereClause(filter);
        const products = await this.prisma.product.findMany({
            where,
        });
        return products;
    }

    async getProductsByFilterWithStock(filter: Partial<ProductReq>): Promise<ProductWithStock[]> {
        const where = this.buildWhereClause(filter);
        const products: ProductWithStock[] = await this.prisma.product.findMany({
            where,
            include: {
                productStores: {
                    include: {
                        store: true,
                    },
                },
            },
        });
        return products;
    }

    private buildWhereClause(filter: Partial<ProductReq>): ProductWhereClause {
        const { name, storeId, ...restFilter } = filter;
        const where: ProductWhereClause = { ...restFilter };

        if (name) {
            where.name = {
                contains: name,
                mode: 'insensitive'
            };
        }

        if (storeId) {
            where.productStores = {
                some: {
                    storeId
                }
            };
        }

        return where;
    }
}