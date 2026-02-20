import { User } from "./entities";
import { UserModel } from "../../../prisma/generated/models/User";

export const toDomainModel = (createdUser: UserModel & { referrals?: UserModel[] }): User => {
  return {
    id: createdUser.id,
    email: createdUser.email,
    role: createdUser.role,
    image: createdUser.image,
    createdAt: createdUser.createdAt,
    updatedAt: createdUser.updatedAt,
    referralCode: createdUser.referralCode,
    storeId: createdUser.storeId,
    referredById: createdUser.referredById,
    name: createdUser.name,
    emailVerified: createdUser.emailVerified,
    employeeJoinedAt: createdUser.employeeJoinedAt,
    referrals: createdUser.referrals ? createdUser.referrals.map(toDomainModel) : [],
  };
};

export const toDomainModels = (users: UserModel[]): User[] => {
  return users.map((user) => toDomainModel(user));
};
