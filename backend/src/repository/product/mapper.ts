import { ProductModel, ProductStoreModel } from '../../../prisma/generated/models';
import { Product } from './entities';

export function toDomainModel (prismaModel: ProductModel): Product {
    return {
        id: prismaModel.id,
        name: prismaModel.name,
        categoryId: prismaModel.categoryId,
        description: prismaModel.description,
        price: prismaModel.price,
        createAt: prismaModel.createAt,
        updatedAt: prismaModel.updatedAt,
    };
}

export function toDomainModels (prismaModels: ProductModel[]): Product[] {
    return prismaModels.map(prismaModel => toDomainModel(prismaModel));
}