import { ProductsRepo, PaginationParams, PaginatedResponse } from './interface';
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

    private getPageParams(pagination?: PaginationParams): { skip: number; take?: number } {
        return { skip: pagination ? (pagination.page - 1) * pagination.limit : 0, take: pagination ? pagination.limit : undefined };
    }

    private buildMeta(pagination: PaginationParams | undefined, total: number) {
        return {
            page: pagination?.page ?? 1,
            limit: pagination?.limit ?? total,
            total,
            totalPages: pagination ? Math.ceil(total / pagination.limit) : 1,
        };
    }

    private buildStockWhere(baseWhere: ProductWhereClause, filter: Partial<GetProductReq>): ProductWhereClause {
        if (filter.inStockOnly && filter.storeId) {
            return { ...baseWhere, productStores: { some: { storeId: filter.storeId, quantity: { gt: 0 } } as any } } as ProductWhereClause;
        }
        if (filter.inStockOnly) return { ...baseWhere, productStores: { some: { quantity: { gt: 0 } } as any } } as ProductWhereClause;
        if (filter.storeId) return { ...baseWhere, productStores: { some: { storeId: filter.storeId } } } as ProductWhereClause;
        return baseWhere;
    }

    private buildCreateInput(data: CreateProductReq): ProductCreateInput {
        const now = new Date();
        return {
            name: data.name, description: data.description, price: data.price,
            createAt: now, updatedAt: now, weight: data.weight,
            category: { connect: { id: data.categoryId } },
        };
    }

    private buildUpdateInput(data: Partial<UpdateProductReq>): Partial<ProductCreateInput> {
        return {
            ...data,
            updatedAt: new Date(),
            category: data.categoryId ? { connect: { id: data.categoryId } } : undefined,
        };
    }

    private async queryProducts(where: ProductWhereClause, skip: number, take?: number) {
        return Promise.all([
            this.prisma.product.findMany({ where, include: { category: true, productImages: true }, skip, take }),
            this.prisma.product.count({ where }),
        ]);
    }

    private async queryProductsWithStock(where: ProductWhereClause, filter: Partial<GetProductReq>, skip: number, take?: number) {
        return Promise.all([
            this.prisma.product.findMany({
                where: where as any,
                include: { category: true, productImages: true, productStores: { where: filter.storeId ? { storeId: filter.storeId } : undefined, include: { store: true } } },
                skip,
                take,
            }),
            this.prisma.product.count({ where: where as any }),
        ]);
    }

    async getProductsByFilter(filter: Partial<GetProductReq>, pagination?: PaginationParams): Promise<PaginatedResponse<Product>> {
        const where = this.buildWhereClause(filter);
        const { skip, take } = this.getPageParams(pagination);
        const [products, total] = await this.queryProducts(where, skip, take);
        return { data: toDomainModels(products), meta: this.buildMeta(pagination, total) };
    }

    async getProductsByFilterWithStock(filter: Partial<GetProductReq>, pagination?: PaginationParams): Promise<PaginatedResponse<ProductWithStock>> {
        const baseWhere = this.buildWhereClause(filter);
        const where = this.buildStockWhere(baseWhere, filter);
        const { skip, take } = this.getPageParams(pagination);
        const [products, total] = await this.queryProductsWithStock(where, filter, skip, take);
        return { data: toDomainModelsWithStock(products), meta: this.buildMeta(pagination, total) };
    }

    private buildWhereClause(filter: Partial<GetProductReq>): ProductWhereClause {
        const { name, storeId: _storeId, inStockOnly: _inStockOnly, ...restFilter } = filter;
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
        const createdProduct = await this.prisma.product.create({
            data: this.buildCreateInput(data),
            include: {
                category: true,
                productImages: true,
            },
        });
        return toDomainModel(createdProduct);
    }
    
    async updateProduct(id: string, data: Partial<UpdateProductReq>): Promise<Product> {
        const updatedProduct = await this.prisma.product.update({
            where: { id: id },
            data: this.buildUpdateInput(data),
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