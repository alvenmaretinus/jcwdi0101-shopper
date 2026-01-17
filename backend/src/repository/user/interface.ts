import { UserReq, User } from "./entities";

export interface UsersRepo {
    createUser(data: UserReq): Promise<User>;
    getUsersByFilter(filter: Partial<UserReq>): Promise<User[]>;
    updateUser(id: string, data: Partial<UserReq>): Promise<User>;
    deleteUser(id: string): Promise<void>;
}