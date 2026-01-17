import { PrismaClient } from '../../../prisma/generated/client';
import { UsersRepo } from './interface';
import { UserCreateInput, UserUpdateInput } from '../../../prisma/generated/models';
import { UserRole } from '../../../prisma/generated/enums';
import {v4} from 'uuid';
import { UserReq, User } from './entities';
import {toDomainModel, toDomainModels} from './mapper';


export class PostgresRepository implements UsersRepo {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async createUser(
        data: UserReq): Promise<User> {
        const now: Date = new Date();
        const userData: UserCreateInput = {
            id: data.id,
            email: data.email,
            role: data.role ?? UserRole.USER,
            profileUrl: data.profileUrl,
            createdAt: now,
            updatedAt: now,
            referralCode: data.referralCode,
        };
        const createdUser = await this.prisma.user.create({
            data: userData,
        });
        
        return toDomainModel(createdUser);
    }

    async getUsersByFilter(filter: Partial<UserReq>): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            where: filter,
        });
        return toDomainModels(users);
    }

    async updateUser(id: string, data: Partial<UserReq>): Promise<User> {
        const userData: UserUpdateInput = { ...data, updatedAt: new Date() };
        const updatedUser = await this.prisma.user.update({
            where: { id: id },
            data: userData,
        });
        return toDomainModel(updatedUser);
    }

    async deleteUser(id: string): Promise<void> {
        await this.prisma.user.delete({
            where: { id: id },
        });
    }
}