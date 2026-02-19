import { UserReq, User } from "./entities";

export interface UsersRepo {
    createUser(data: UserReq): Promise<User>;
    getUsersByFilter(filter: Partial<UserReq>): Promise<User[]>;
    updateUser(id: string, data: Partial<UserReq>): Promise<User>;
    setReferredByOnce(userId: string, referrerId: string): Promise<boolean>;
    deleteUser(id: string): Promise<void>;
}