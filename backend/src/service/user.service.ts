import { UsersRepo } from '../repository/user/interface';
import { UserReq as UserReq, User } from '../repository/user/entities';
import { UserRole } from '../../prisma/generated/client';
import { CreateUserInput } from '../schema/user/CreateUserSchema';
import { UpdateUserInput } from '../schema/user/UpdateUserSchema';
import { GetUsersByFilterInput } from '../schema/user/GetUsersByFilterSchema';
import { NotFoundError } from '../error/NotFoundError';
import { UnauthorizedError } from '../error/UnauthorizedError';
import { BadRequestError } from '../error/BadRequestError';
import {v4} from "uuid";


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

    async createUser(input: CreateUserInput, currentUser?: UserPayload): Promise<User> {
        // Check if ADMIN role is being assigned by non-SUPERADMIN
        if (input.role === UserRole.ADMIN && currentUser?.role !== UserRole.SUPERADMIN) {
            throw new UnauthorizedError('Only Super Admins can create Admin users');
        }

        //Check if the created role is a Super Admin
        if (input.role === UserRole.SUPERADMIN) {
            throw new UnauthorizedError('Cannot create Super Admin users');
        }

        const now: Date = new Date();

        const createUserReq: UserReq = {
            id: v4(),
            email: input.email,
            role: input.role as UserRole,
            profileUrl: input.profileUrl ?? "https://placehold.co/600x400/png", // TODO: replace with actual default profile URL logic
            referralCode: input.role as UserRole == UserRole.USER ? v4() : undefined, // Only USERs get referral codes
            storeId: input.storeId,
        };

        return await this.usersRepo.createUser(createUserReq);
    }

    async getUserByID(userId: string): Promise<User> {
        const users = await this.usersRepo.getUsersByFilter({ id: userId });
        
        if (users.length === 0) {
            throw new NotFoundError('User not found');
        }
        
        return users[0];
    }

    async getUsersByFilter(input: GetUsersByFilterInput): Promise<User[]> {
        return await this.usersRepo.getUsersByFilter(input);
    }

    async updateUser(userId: string, input: UpdateUserInput, currentUser?: UserPayload): Promise<User> {
        const users = await this.usersRepo.getUsersByFilter({ id: userId });
        
        if (users.length === 0) {
            throw new NotFoundError('User not found');
        }

        // Check if trying to update an ADMIN user without SUPERADMIN privileges
        if ((users[0].role === UserRole.ADMIN || users[0].role === UserRole.SUPERADMIN) && currentUser?.role !== UserRole.SUPERADMIN) {
            throw new UnauthorizedError('Only Super Admins can update Admin users');
        }

        const updateUserReq: Partial<UserReq> = this.#generateUpdateUserReq(input);

        return await this.usersRepo.updateUser(userId, updateUserReq);
    }

    #generateUpdateUserReq(input: UpdateUserInput): Partial<UserReq> {
        const updateUserReq: Partial<UserReq> = {};
        
        if (input.email !== undefined) {
            updateUserReq.email = input.email;
        }
        if (input.role !== undefined) {
            updateUserReq.role = input.role as UserRole;
        }
        if (input.profileUrl !== undefined) {
            updateUserReq.profileUrl = input.profileUrl;
        }
        if (input.storeId !== undefined) {
            updateUserReq.storeId = input.storeId;
        }
        return updateUserReq;
    }

    async deleteUser(userId: string, currentUser?: UserPayload): Promise<void> {
        const users = await this.usersRepo.getUsersByFilter({ id: userId });
        
        if (users.length === 0) {
            throw new NotFoundError('User not found');
        }

        const targetUser = users[0];

        // Prevent users from deleting themselves
        if (currentUser && currentUser.id === targetUser.id) {
            throw new BadRequestError('Users cannot delete themselves');
        }
        // Prevent deletion of SUPERADMIN users
        if (currentUser && targetUser.role === UserRole.SUPERADMIN) {
            throw new UnauthorizedError('Super Admin users cannot be deleted');
        }

        await this.usersRepo.deleteUser(userId);
    }
}
