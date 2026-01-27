import { CreateUserAddressInput } from "../schema/user-address/CreateUserAddressSchema";
import { UpdateUserAddressInput } from "../schema/user-address/UpdateUserAddressSchema";
import { UserAddressIdInput } from "../schema/user-address/UserAddressIdSchema";
import { NotFoundError } from "../error/NotFoundError";
import { prisma } from "../lib/db/prisma";
import { ConflictError } from "../error/ConflictError";

export class UserAddressService {
  static async createAddress(data: CreateUserAddressInput) {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const existingAddressesCount = await prisma.userAddress.count({
      where: { userId: data.userId },
    });

    const isDefault = existingAddressesCount === 0;

    if (isDefault) {
      await prisma.userAddress.updateMany({
        where: { userId: data.userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return await prisma.userAddress.create({
      data: {
        ...data,
        isDefault,
      },
    });
  }

  static async updateAddress(userId: string, data: UpdateUserAddressInput) {
    const { id, ...updateData } = data;
    const address = await prisma.userAddress.findUnique({
      where: { id },
    });
    if (!address) {
      throw new NotFoundError("Address not found");
    }

    if (address.isDefault === true && updateData.isDefault === false) {
      throw new ConflictError("Default address cannot be deleted");
    }

    if (address.isDefault === updateData.isDefault) {
      await prisma.userAddress.update({
        where: { id },
        data: updateData,
      });
    } else {
      const defaultAddress = await prisma.userAddress.findFirst({
        where: { userId, isDefault: true },
      });

      if (!defaultAddress) {
        throw new NotFoundError("Default address not found");
      }

      await prisma.$transaction(async (tx) => {
        await tx.userAddress.update({
          where: { id: defaultAddress.id },
          data: { isDefault: false },
        });

        await tx.userAddress.update({
          where: { id },
          data: { ...updateData, isDefault: true },
        });
      });
    }
  }

  static async deleteAddress(userId: string, data: UserAddressIdInput) {
    const { id } = data;
    const existingAddressesCount = await prisma.userAddress.count({
      where: { userId },
    });

    if (existingAddressesCount === 1) {
      throw new ConflictError("Cannot delete the last address");
    }

    const address = await prisma.userAddress.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundError("Address not found");
    }

    const result = await prisma.userAddress.delete({
      where: { id, userId },
    });

    // If we deleted the default, set the next available one as default
    if (address.isDefault) {
      const remaining = await prisma.userAddress.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (remaining) {
        await prisma.userAddress.update({
          where: { id: remaining.id },
          data: { isDefault: true },
        });
      }
    }

    return result;
  }

  static async getDefaultAddressByUserId(userId: string) {
    return await prisma.userAddress.findFirst({
      where: { userId, isDefault: true },
    });
  }

  static async getAddressesByUserId(userId: string) {
    return await prisma.userAddress.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    });
  }

  static async getAddressById(data: UserAddressIdInput) {
    const { id } = data;
    return await prisma.userAddress.findUnique({
      where: { id },
    });
  }
}
