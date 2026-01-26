import { PrismaClient } from "../../../prisma/generated/client";
import { CreateProductCategoryReq, GetProductCategoryReq, ProductCategory } from "./entities";
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
        const now = new Date();
        const newCategory = await this.prisma.productCategory.create({
            data: {
                ...data,
                createdAt: now,
                updatedAt: now,
            },
        });
        return newCategory;
    }
    async updateCategory(id: string, data: ProductCategory): Promise<ProductCategory> {
        const updatedCategory = await this.prisma.productCategory.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
        return updatedCategory;
    }
    async deleteCategory(id: string): Promise<void> {
        await this.prisma.productCategory.delete({
            where: { id },
        });
    }
}