import { Prisma, PrismaClient } from "../../../prisma/generated/client";
import { ConflictError } from "../../error/ConflictError";
import { NotFoundError } from "../../error/NotFoundError";
import { CreateProductCategoryReq, GetProductCategoryReq, ProductCategory, UpdateProductCategoryReq } from "./entities";
import { PaginationParams, PaginatedResponse, ProductCategoryRepo } from "./interface";

export class PrismaRepository implements ProductCategoryRepo {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }
    async getCategoriesByFilter(
        filter: Partial<GetProductCategoryReq>,
        pagination: PaginationParams = { page: 1, limit: 20 },
    ): Promise<PaginatedResponse<ProductCategory>> {
        const page = Math.max(1, pagination.page);
        const limit = Math.max(1, pagination.limit);
        const skip = (page - 1) * limit;

        const where = {
            id: filter.id,
            name: filter.name
                ? { contains: filter.name, mode: 'insensitive' as const }
                : undefined,
        };

        const [categories, total] = await Promise.all([
            this.prisma.productCategory.findMany({
                where,
                skip,
                take: limit,
                orderBy: { name: 'asc' },
            }),
            this.prisma.productCategory.count({ where }),
        ]);

        return {
            data: categories,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        };
    }
    async getCategoryById(id: string): Promise<ProductCategory | null> {
        const category = await this.prisma.productCategory.findUnique({
            where: { id },
        });
        return category;
    }
    async createCategory(data: CreateProductCategoryReq): Promise<ProductCategory> {
        try {
            const newCategory = await this.prisma.productCategory.create({
                data: data,
            });
            return newCategory;
        } catch (error: any) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                (error.code === 'P2003' || error.code === 'P2014')
            ) {
                // Foreign key constraint violation: category has related products
                throw new ConflictError("Cannot create category because there are products associated with the data supplied");
            }
            throw error;
        }
    }
    async updateCategory(id: string, data: UpdateProductCategoryReq): Promise<ProductCategory> {
        let updatedCategory: ProductCategory;
        try {
            updatedCategory = await this.prisma.productCategory.update({
                where: { id },
                data: {
                    ...data,
                },
            });
        } catch (error: any) {
            // TODO: Handle more errors if needed 
            // e.g. if we want to emit custom error conflict with unique keys upon rename
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundError("Category not found");
            }
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                // Unique constraint violation: attempting to rename to an existing category name
                throw new ConflictError("Cannot update category because a category with the given name already exists");
            }
            throw error;
        }
        return updatedCategory;
    }
    async deleteCategory(id: string): Promise<void> {
        try {
            await this.prisma.productCategory.delete({
                where: { id },
            });
        } catch (error: any) {
            // TODO: Handle more errors if needed
            // e.g. additional constraint violations specific to delete operations
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundError("Category not found");
            }
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                (error.code === 'P2003' || error.code === 'P2014')
            ) {
                // Foreign key constraint violation: category has related products
                throw new ConflictError("Cannot delete category because there are products associated with it");
            }
            throw error;
        }
    }
}