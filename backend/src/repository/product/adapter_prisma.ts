import { ProductsRepo, PaginationParams, PaginatedResponse } from './interface';
import { PrismaClient } from '../../../prisma/generated/client';
import { Product, CreateProductReq, GetProductReq, ProductWhereClause, UpdateProductReq, ProductWithStock } from './entities';
import { ProductUncheckedCreateInput, ProductUncheckedUpdateInput} from '../../../prisma/generated/models';
import { toDomainModel, toDomainModels, toDomainModelsWithStock } from './mapper';
import { QueryMode } from '../../../prisma/generated/internal/prismaNamespaceBrowser';


export class PrismaRepository implements ProductsRepo {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    private buildOrderBy(sort?: PaginationParams["sort"]) {
        switch (sort) {
            case 'name':
                return [{ name: 'asc' as const }, { createAt: 'desc' as const }];
            case 'price-low':
                return [{ price: 'asc' as const }, { createAt: 'desc' as const }];
            case 'price-high':
                return [{ price: 'desc' as const }, { createAt: 'desc' as const }];
            case 'featured':
            default:
                return [{ createAt: 'desc' as const }];
        }
    }

    async getProductsByFilter(filter: Partial<GetProductReq>, pagination?: PaginationParams): Promise<PaginatedResponse<Product>> {
        const where = this.buildWhereClause(filter);
        const orderBy = this.buildOrderBy(pagination?.sort);
        
        const skip = pagination ? (pagination.page - 1) * pagination.limit : 0;
        const take = pagination ? pagination.limit : undefined;

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                include: {
                    category: true,
                    productImages: true,
                },
                orderBy,
                skip,
                take,
            }),
            this.prisma.product.count({ where }),
        ]);

        return {
            data: toDomainModels(products),
            meta: {
                page: pagination?.page ?? 1,
                limit: pagination?.limit ?? total,
                total,
                totalPages: pagination ? Math.ceil(total / pagination.limit) : 1,
            },
        };
    }

    async getProductsByFilterWithStock(filter: Partial<GetProductReq>, pagination?: PaginationParams): Promise<PaginatedResponse<ProductWithStock>> {
        const baseWhere = this.buildWhereClause(filter);
        const orderBy = this.buildOrderBy(pagination?.sort);
        
        // Build productStores filter based on inStockOnly and storeId
        let where = { ...baseWhere };
        
        if (filter.inStockOnly) {
            // Require at least one product store with quantity > 0
            if (filter.storeId) {
                where = {
                    ...where,
                    productStores: {
                        some: {
                            storeId: filter.storeId,
                            quantity: { gt: 0 }
                        } as any
                    }
                };
            } else {
                where = {
                    ...where,
                    productStores: {
                        some: {
                            quantity: { gt: 0 }
                        } as any
                    }
                };
            }
        } else if (filter.storeId) {
            // If only storeId is provided (no inStockOnly), include all products from that store
            where = {
                ...where,
                productStores: {
                    some: { storeId: filter.storeId }
                }
            };
        }
        
        const skip = pagination ? (pagination.page - 1) * pagination.limit : 0;
        const take = pagination ? pagination.limit : undefined;

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where: where as any,
                include: {
                    category: true,
                    productImages: true,
                    productStores: {
                        where: filter.storeId ? { storeId: filter.storeId } : undefined,
                        include: {
                            store: true,
                        },
                    },
                },
                orderBy,
                skip,
                take,
            }),
            this.prisma.product.count({ where: where as any }),
        ]);
        
        return {
            data: toDomainModelsWithStock(products),
            meta: {
                page: pagination?.page ?? 1,
                limit: pagination?.limit ?? total,
                total,
                totalPages: pagination ? Math.ceil(total / pagination.limit) : 1,
            },
        };
    }

    private buildWhereClause(filter: Partial<GetProductReq>): ProductWhereClause {
        const { name, storeId, inStockOnly, ...restFilter } = filter;
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

        // Note: storeId and inStockOnly filtering is handled in the include clause for getProductsByFilterWithStock
        // to allow filtering of productStores rather than products themselves

        return where;
    }

    async createProduct(data: CreateProductReq): Promise<Product> {
        const now = new Date();
    
        const productCreateInput: ProductUncheckedCreateInput = {
            name: data.name,
            description: data.description,
            price: data.price,
            createAt: now,
            updatedAt: now,
            weight: data.weight,
            categoryId: data.categoryId,
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
        const productUpdateData: ProductUncheckedUpdateInput = {
            ...data,
            updatedAt: new Date(),
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