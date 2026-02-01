import { User } from "./entities";
import { UserModel } from "../../../prisma/generated/models/User";

export const toDomainModel = (createdUser: UserModel): User => {
  return {
    id: createdUser.id,
    email: createdUser.email,
    role: createdUser.role,
    image: createdUser.image,
    createdAt: createdUser.createdAt,
    updatedAt: createdUser.updatedAt,
    referralCode: createdUser.referralCode,
    storeId: createdUser.storeId,
  };
};

export const toDomainModels = (users: UserModel[]): User[] => {
  return users.map((user) => toDomainModel(user));
};
