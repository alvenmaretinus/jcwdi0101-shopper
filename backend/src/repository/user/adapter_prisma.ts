import { PrismaClient } from '../../../prisma/generated/client';
import { UsersRepo } from './interface';
import { UserCreateInput } from '../../../prisma/generated/models';
import { UserRole } from '../../../prisma/generated/enums';
import {v4} from 'uuid';
import { CreateUserReq, User } from './entities';
import {toDomainModel, toDomainModels} from './mapper';


export class PostgresRepository implements UsersRepo {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async createUser(
        data: CreateUserReq): Promise<User> {
        const userData: UserCreateInput = {
            id: v4(),
            email: data.email,
            role: data.role ?? UserRole.USER,
            profileUrl: data.profileUrl,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            referralCode: data.referralCode,
        };
        const createdUser = await this.prisma.user.create({
            data: userData,
        });
        
        return toDomainModel(createdUser);
    }

    async getUsersByFilter(filter: any): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            where: filter,
        });
        return toDomainModels(users);
    }

    async updateUser(id: string, data: Partial<CreateUserReq>): Promise<User> {
        const updatedUser = await this.prisma.user.update({
            where: { id: id },
            data: data,
        });
        return toDomainModel(updatedUser);
    }

    async deleteUser(id: string): Promise<void> {
        await this.prisma.user.delete({
            where: { id: id },
        });
    }
}