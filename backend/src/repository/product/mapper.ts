import { Prisma } from '../../../prisma/generated/client';
import { ProductModel } from '../../../prisma/generated/models';
import { Product, ProductWithStock } from './entities';

// Type for Prisma results that include category and productImages
type PrismaProductWithRelations = Prisma.ProductGetPayload<{
    include: {
        category: true;
        productImages: true;
    };
}>;

export function toDomainModel (prismaModel: ProductModel | PrismaProductWithRelations): Product {
    const base: Product = {
        id: prismaModel.id,
        name: prismaModel.name,
        categoryId: prismaModel.categoryId,
        description: prismaModel.description,
        price: prismaModel.price,
        createAt: prismaModel.createAt,
        updatedAt: prismaModel.updatedAt,
        weight: prismaModel.weight,
        isSoftDeleted: prismaModel.isSoftDeleted,
    };

    // Add category and productImages if present
    if ('category' in prismaModel && prismaModel.category) {
        base.category = prismaModel.category;
    }
    if ('productImages' in prismaModel) {
        base.productImages = prismaModel.productImages || [];
    }

    return base;
}

export function toDomainModels (prismaModels: (ProductModel | PrismaProductWithRelations)[]): Product[] {
    return prismaModels.map(prismaModel => toDomainModel(prismaModel));
}

// Mapper for Prisma results that include productStores -> ProductWithStock
type PrismaProductWithStores = Prisma.ProductGetPayload<{
    include: {
        category: true;
        productImages: true;
        productStores: {
            include: {
                store: true;
            };
        };
    };
}>;

export function toDomainModelsWithStock(prismaModels: PrismaProductWithStores[]): ProductWithStock[] {
    return prismaModels.map(pm => {
        const base = toDomainModel(pm);

        const productStores = pm.productStores.map(ps => ({
            storeId: ps.storeId,
            id: ps.id,
            createdAt: ps.createdAt,
            updatedAt: ps.updatedAt,
            quantity: ps.quantity,
            productId: ps.productId,
            store: ps.store,
        }));

        const totalStock = productStores.reduce((acc, s) => acc + (s.quantity || 0), 0);

        const result: ProductWithStock = {
            ...base,
            productStores,
            totalStock,
        };

        return result;
    });
}