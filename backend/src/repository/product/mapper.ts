import { ProductModel, ProductStoreModel } from '../../../prisma/generated/models';
import { Product, ProductWithStock } from './entities';

export function toDomainModel (prismaModel: ProductModel): Product {
    return {
        id: prismaModel.id,
        name: prismaModel.name,
        categoryId: prismaModel.categoryId,
        description: prismaModel.description,
        price: prismaModel.price,
        createAt: prismaModel.createAt,
        updatedAt: prismaModel.updatedAt,
        weight: (prismaModel as any).weight ?? 0,
    };
}

export function toDomainModels (prismaModels: ProductModel[]): Product[] {
    return prismaModels.map(prismaModel => toDomainModel(prismaModel));
}

// Mapper for Prisma results that include productStores -> ProductWithStock
type PrismaProductWithStores = ProductModel & { productStores?: (ProductStoreModel & { store?: any })[] };

export function toDomainModelsWithStock(prismaModels: PrismaProductWithStores[]): ProductWithStock[] {
    return prismaModels.map(pm => {
        const base = toDomainModel(pm);

        const productStores = pm.productStores?.map(ps => ({
            storeId: ps.storeId,
            id: ps.id,
            createdAt: ps.createdAt,
            updatedAt: ps.updatedAt,
            quantity: ps.quantity,
            productId: ps.productId,
            store: ps.store,
        }));

        const totalStock = productStores ? productStores.reduce((acc, s) => acc + (s.quantity || 0), 0) : undefined;

        const result: ProductWithStock = {
            ...base,
            productStores,
            totalStock,
        };

        return result;
    });
}