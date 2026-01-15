import { PrismaClient } from '../../../prisma/generated/client';
import { UsersRepo } from './interface';


export class PostgresRepository implements UsersRepo {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async CreateUser(data: { name: string; email: string }): Promise<{ id: string; name: string; email: string }> {
        const createdUser = await this.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
            },
        });
        return createdUser;
    }
}