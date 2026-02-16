import { ProductsRepo } from './interface';
import { PrismaClient } from '../../../prisma/generated/client';
import { Product, CreateProductReq, GetProductReq, ProductWhereClause, UpdateProductReq, ProductWithStock } from './entities';
import { ProductCreateInput} from '../../../prisma/generated/models';
import { toDomainModel, toDomainModels, toDomainModelsWithStock } from './mapper';
import { QueryMode } from '../../../prisma/generated/internal/prismaNamespaceBrowser';


export class PrismaRepository implements ProductsRepo {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async getProductsByFilter(filter: Partial<GetProductReq>): Promise<Product[]> {
        const where = this.buildWhereClause(filter);
        const products = await this.prisma.product.findMany({
            where,
            include: {
                category: true,
                productImages: true,
            },
        });
        return toDomainModels(products);
    }

    async getProductsByFilterWithStock(filter: Partial<GetProductReq>): Promise<ProductWithStock[]> {
        const where = this.buildWhereClause(filter);
        const products = await this.prisma.product.findMany({
            where,
            include: {
                category: true,
                productImages: true,
                productStores: {
                    include: {
                        store: true,
                    },
                },
            },
        });
        
        return toDomainModelsWithStock(products);
    }

    private buildWhereClause(filter: Partial<GetProductReq>): ProductWhereClause {
        const { name, storeId, ...restFilter } = filter;
        const where: ProductWhereClause = { 
            ...restFilter,
            isSoftDeleted: false // Filter out soft-deleted products by default
        };

        if (name) {
            where.name = {
                contains: name,
                mode: QueryMode.insensitive
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
            weight: data.weight,
            category: { connect: { id: data.categoryId } }, 
        };

        const createdProduct = await this.prisma.product.create({
            data: productCreateInput,
            include: {
                category: true,
                productImages: true,
            },
        });
        return toDomainModel(createdProduct);
    }
    
    async updateProduct(id: string, data: Partial<UpdateProductReq>): Promise<Product> {
        const productUpdateData: Partial<ProductCreateInput> = {
            ...data,
            updatedAt: new Date(),
            category: data.categoryId? { connect:  { id: data.categoryId } } : undefined
        };


        const updatedProduct = await this.prisma.product.update({
            where: { id: id },
            data: productUpdateData,
            include: {
                category: true,
                productImages: true,
            },
        });
        return toDomainModel(updatedProduct);
    }

    async deleteProduct(id: string): Promise<void> {
        await this.prisma.product.update({
            where: { id: id },
            data: {
                isSoftDeleted: true,
                updatedAt: new Date(),
            },
        });
    }
}