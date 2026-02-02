import { Prisma, PrismaClient } from "../../../prisma/generated/client";
import { NotFoundError } from "../../error/NotFoundError";
import { CreateProductCategoryReq, GetProductCategoryReq, ProductCategory, UpdateProductCategoryReq } from "./entities";
import { ProductCategoryRepo } from "./interface";

export class PrismaRepository implements ProductCategoryRepo {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }
    async getCategoriesByFilter(filter: Partial<GetProductCategoryReq>): Promise<ProductCategory[]> {
        const categories = await this.prisma.productCategory.findMany({
            where: filter,
        });
        return categories;
    }
    async getCategoryById(id: string): Promise<ProductCategory | null> {
        const category = await this.prisma.productCategory.findUnique({
            where: { id },
        });
        return category;
    }
    async createCategory(data: CreateProductCategoryReq): Promise<ProductCategory> {
        const newCategory = await this.prisma.productCategory.create({
            data: data,
        });
        return newCategory;
    }
    async updateCategory(id: string, data: UpdateProductCategoryReq): Promise<ProductCategory> {
        let updatedCategory: ProductCategory;
        try{
            updatedCategory = await this.prisma.productCategory.update({
                where: { id },
                data: {
                    ...data,
                    updatedAt: new Date(Date.now()),
                },
            });
        } catch (error: any) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundError("Category not found");
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
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                throw new NotFoundError("Failed to delete category");
            }
            throw error;
        }
    }
}