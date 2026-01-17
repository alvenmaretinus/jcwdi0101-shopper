import { UserRole } from '../../../prisma/generated/enums';

export type UserReq = {
    id: string;
    email: string;
    role: UserRole;
    profileUrl: string;
    referralCode?: string;
    storeId?: string;
};


export type User = {
    email: string;
    id: string;
    role: UserRole;
    profileUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    referralCode: string;
    storeId: string | null;
}
