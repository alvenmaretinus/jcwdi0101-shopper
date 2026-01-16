import { CreateUserReq, User } from "./entities";

export interface UsersRepo {
    CreateUser(data: CreateUserReq): Promise<User>;
    GetUsersByFilter(filter: any): Promise<User[]>;
    UpdateUser(id: string, data: Partial<CreateUserReq>): Promise<User>;
    DeleteUser(id: string): Promise<void>;
}