
export interface UsersRepo {
    CreateUser(data: { name: string; email: string }): Promise<{ id: string; name: string; email: string }>;
}