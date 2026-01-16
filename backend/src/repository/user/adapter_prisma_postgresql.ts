import { PrismaClient } from '../../../prisma/generated/client';
import { UsersRepo } from './interface';
import { UserCreateInput } from '../../../prisma/generated/models';
import { UserRole } from '../../../prisma/generated/enums';
import * as randomUUID from 'uuid';
import { CreateUserReq, User } from './entities';
import {ToDomainModel, ToDomainModels} from './mapper';


export class PostgresRepository implements UsersRepo {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async CreateUser(
        data: CreateUserReq): Promise<User> {
        const userData: UserCreateInput = {
            id: randomUUID.v4(),
            email: data.email,
            role: data.role ?? UserRole.USER,
            profileUrl: data.profileUrl,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            referralCode: randomUUID.v4(),
        };
        const createdUser = await this.prisma.user.create({
            data: userData,
        });
        
        return ToDomainModel(createdUser);
    }

    async GetUsersByFilter(filter: any): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            where: filter,
        });
        return ToDomainModels(users);
    }

    async UpdateUser(id: string, data: Partial<CreateUserReq>): Promise<User> {
        const updatedUser = await this.prisma.user.update({
            where: { id: id },
            data: data,
        });
        return ToDomainModel(updatedUser);
    }

    async DeleteUser(id: string): Promise<void> {
        await this.prisma.user.delete({
            where: { id: id },
        });
    }
}