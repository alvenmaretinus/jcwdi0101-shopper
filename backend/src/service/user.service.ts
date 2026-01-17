import { UsersRepo } from '../repository/user/interface';
import { CreateUserReq, User } from '../repository/user/entities';
import { UserRole } from '../../prisma/generated/client';
import { CreateUserInput } from '../schema/user/CreateUserSchema';
import { UpdateUserInput } from '../schema/user/UpdateUserSchema';
import { BadRequestError } from '../error/BadRequestError ';
import { NotFoundError } from '../error/NotFoundError';
import { UnauthorizedError } from '../error/UnauthorizedError ';

interface UserPayload {
    id: string;
    email: string;
    role: UserRole;
}

export class UserService { 
    private usersRepo: UsersRepo;
    
    constructor(usersRepo: UsersRepo) {
        this.usersRepo = usersRepo;
    }

    async CreateUser(input: CreateUserInput, currentUser?: UserPayload): Promise<User> {
        // Check if ADMIN role is being assigned by non-SUPERADMIN
        if (input.role === UserRole.ADMIN && currentUser?.role !== UserRole.SUPERADMIN) {
            throw new UnauthorizedError('Only Super Admins can create Admin users');
        }

        const createUserReq: CreateUserReq = { 
            email: input.email,
            role: input.role as UserRole,
            profileUrl: input.profileUrl,
            referralCode: input.referralCode,
            storeId: input.storeId
        };

        return await this.usersRepo.CreateUser(createUserReq);
    }

    async GetUserByID(userId: string): Promise<User> {
        const users = await this.usersRepo.GetUsersByFilter({ id: userId });
        
        if (users.length === 0) {
            throw new NotFoundError('User not found');
        }
        
        return users[0];
    }

    async GetUsersByFilter(): Promise<User[]> {
        return await this.usersRepo.GetUsersByFilter({});
    }

    async UpdateUser(userId: string, input: UpdateUserInput, currentUser?: UserPayload): Promise<User> {
        const users = await this.usersRepo.GetUsersByFilter({ id: userId });
        
        if (users.length === 0) {
            throw new NotFoundError('User not found');
        }

        // Check if trying to update an ADMIN user without SUPERADMIN privileges
        if (users[0].role === UserRole.ADMIN && currentUser?.role !== UserRole.SUPERADMIN) {
            throw new UnauthorizedError('Only Super Admins can update Admin users');
        }

        const updateUserReq: Partial<CreateUserReq> = {
            email: input.email,
            role: input.role as UserRole | undefined,
            profileUrl: input.profileUrl ?? undefined,
            referralCode: input.referralCode,
            storeId: input.storeId ?? undefined,
        };

        return await this.usersRepo.UpdateUser(userId, updateUserReq);
    }

    async DeleteUser(userId: string): Promise<void> {
        const users = await this.usersRepo.GetUsersByFilter({ id: userId });
        
        if (users.length === 0) {
            throw new NotFoundError('User not found');
        }

        await this.usersRepo.DeleteUser(userId);
    }
}
