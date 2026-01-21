import { ProductsRepo } from './interface';
import { PrismaClient } from '../../../prisma/generated/client';
import { Product, CreateProductReq, GetProductReq, ProductWithStock, ProductWhereClause } from './entities';
import { ProductCreateInput} from '../../../prisma/generated/models';
import { toDomainModel, toDomainModels } from './mapper';


export class PrismaRepository implements ProductsRepo {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async getProductsByFilter(filter: Partial<GetProductReq>): Promise<Product[]> {
        const where = this.buildWhereClause(filter);
        const products = await this.prisma.product.findMany({
            where,
        });
        return toDomainModels(products);
    }

    async getProductsByFilterWithStock(filter: Partial<GetProductReq>): Promise<ProductWithStock[]> {
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

    private buildWhereClause(filter: Partial<GetProductReq>): ProductWhereClause {
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

    async createProduct(data: CreateProductReq): Promise<Product> {
        const now = new Date();
    
        const productCreateInput: ProductCreateInput = {
            //ID will be created automatically
            name: data.name,
            description: data.description,
            price: data.price,
            createAt: now,
            updatedAt: now,
            category: { connect: { id: data.categoryId } }, 
        };

        const createdProduct = await this.prisma.product.create({
            data: productCreateInput,
        });
        return toDomainModel(createdProduct);
    }
    
    async updateProduct(id: string, data: Partial<CreateProductReq>): Promise<Product> {
        const productUpdateData: Partial<ProductCreateInput> = {
            ...data,
            updatedAt: new Date(),
        };
        const updatedProduct = await this.prisma.product.update({
            where: { id: id },
            data: productUpdateData,
        });
        return toDomainModel(updatedProduct);
    }

    async deleteProduct(id: string): Promise<void> {
        await this.prisma.product.delete({
            where: { id: id },
        });
    }
}