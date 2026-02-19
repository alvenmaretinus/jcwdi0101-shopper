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

    private getPagination(pagination: PaginationParams): { page: number; limit: number; skip: number } {
        const page = Math.max(1, pagination.page);
        const limit = Math.max(1, pagination.limit);
        return { page, limit, skip: (page - 1) * limit };
    }

    private buildCategoryWhere(filter: Partial<GetProductCategoryReq>) {
        return {
            id: filter.id,
            category: filter.category ? { contains: filter.category, mode: "insensitive" as const } : undefined,
        };
    }

    private buildPaginatedResponse(data: ProductCategory[], page: number, limit: number, total: number): PaginatedResponse<ProductCategory> {
        return { data, meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
    }

    private handleCreateError(error: unknown): never {
        if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2003" || error.code === "P2014")) {
            throw new ConflictError("Cannot create category because there are products associated with the data supplied");
        }
        throw error;
    }

    private handleUpdateError(error: unknown): never {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") throw new NotFoundError("Category not found");
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new ConflictError("Cannot update category because a category with the given name already exists");
        }
        throw error;
    }

    private handleDeleteError(error: unknown): never {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") throw new NotFoundError("Category not found");
        if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P2003" || error.code === "P2014")) {
            throw new ConflictError("Cannot delete category because there are products associated with it");
        }
        throw error;
    }

    async getCategoriesByFilter(filter: Partial<GetProductCategoryReq>, pagination: PaginationParams = { page: 1, limit: 20 }): Promise<PaginatedResponse<ProductCategory>> {
        const { page, limit, skip } = this.getPagination(pagination);
        const where = this.buildCategoryWhere(filter);
        const [categories, total] = await Promise.all([
            this.prisma.productCategory.findMany({ where, skip, take: limit, orderBy: { category: "asc" } }),
            this.prisma.productCategory.count({ where }),
        ]);
        return this.buildPaginatedResponse(categories, page, limit, total);
    }
    async getCategoryById(id: string): Promise<ProductCategory | null> {
        const category = await this.prisma.productCategory.findUnique({
            where: { id },
        });
        return category;
    }
    async createCategory(data: CreateProductCategoryReq): Promise<ProductCategory> {
        try {
            return await this.prisma.productCategory.create({ data });
        } catch (error: unknown) {
            this.handleCreateError(error);
        }
    }

    async updateCategory(id: string, data: UpdateProductCategoryReq): Promise<ProductCategory> {
        try {
            return await this.prisma.productCategory.update({ where: { id }, data: { ...data } });
        } catch (error: unknown) {
            this.handleUpdateError(error);
        }
    }

    async deleteCategory(id: string): Promise<void> {
        try {
            await this.prisma.productCategory.delete({ where: { id } });
        } catch (error: unknown) {
            this.handleDeleteError(error);
        }
    }
}