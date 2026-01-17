import { CreateUserReq as UserReq, User } from "./entities";

export interface UsersRepo {
    createUser(data: UserReq): Promise<User>;
    getUsersByFilter(filter: any): Promise<User[]>;
    updateUser(id: string, data: Partial<UserReq>): Promise<User>;
    deleteUser(id: string): Promise<void>;
}