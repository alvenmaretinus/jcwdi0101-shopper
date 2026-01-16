
import { User } from './entities';

export const ToDomainModel = (createdUser: any): User => {
    return {
            id: createdUser.id,
            email: createdUser.email,
            role: createdUser.role,
            profileUrl: createdUser.profileUrl,
            createdAt: createdUser.createdAt,
            updatedAt: createdUser.updatedAt,
            referralCode: createdUser.referralCode,
            storeId: createdUser.storeId,
        };
}

export const ToDomainModels = (users: any[]): User[] => {
    return users.map(user => ToDomainModel(user));
}