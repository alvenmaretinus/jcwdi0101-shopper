import { UserRole } from "../../../prisma/generated/enums";

export type UserReq = {
  id: string;
  email: string;
  role: UserRole;
  image: string;
  referralCode?: string;
  referredById?: string;
  storeId?: string;
};

export type User = {
    referrals: User[]; // For stats on how many referrals a user has
    id: string;
    email: string;
    role: UserRole;
    image: string | null;
    referralCode: string;
    storeId: string | null;
    referredById: string | null;
    name: string | null;
    createdAt: Date;
    updatedAt: Date;
    emailVerified: boolean;
    employeeJoinedAt: Date | null;
};
