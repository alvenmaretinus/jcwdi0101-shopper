import { ProductsRepo } from './interface';
import { PrismaClient } from '../../../prisma/generated/client';
import { Product, CreateProductReq, GetProductReq, ProductWhereClause, UpdateProductReq } from './entities';
import { ProductCreateInput} from '../../../prisma/generated/models';
import { toDomainModel, toDomainModels } from './mapper';
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
        });
        return toDomainModels(products);
    }

    async getProductsByFilterWithStock(filter: Partial<GetProductReq>): Promise<Product[]> {
        const where = this.buildWhereClause(filter);
        const productsRaw = await this.prisma.product.findMany({
            where,
            include: {
                productStores: {
                    include: {
                        store: true,
                    },
                },
            },
        });

        return productsRaw.map(prismaProduct => {
            const base = toDomainModel(prismaProduct as any);
            return {
                ...base,
                productStores: prismaProduct.productStores?.map(ps => ({
                    storeId: ps.storeId,
                    id: ps.id,
                    createdAt: ps.createdAt,
                    updatedAt: ps.updatedAt,
                    quantity: ps.quantity,
                    productId: ps.productId,
                    store: {
                        id: ps.store.id,
                        name: ps.store.name,
                        description: ps.store.description,
                        phone: ps.store.phone,
                        longitude: ps.store.longitude,
                        latitude: ps.store.latitude,
                        addressName: ps.store.addressName,
                        createdAt: ps.store.createdAt,
                        updatedAt: ps.store.updatedAt,
                    }
                }))
            } as Product;
        });
    }

    private buildWhereClause(filter: Partial<GetProductReq>): ProductWhereClause {
        const { name, storeId, ...restFilter } = filter;
        const where: ProductWhereClause = { ...restFilter };

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
            category: { connect: { id: data.categoryId } }, 
        };

        const createdProduct = await this.prisma.product.create({
            data: productCreateInput,
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
        });
        return toDomainModel(updatedProduct);
    }

    async deleteProduct(id: string): Promise<void> {
        await this.prisma.product.delete({
            where: { id: id },
        });
    }
}