export type User = {
  email: string;
  id: string;
  role: UserRole;
  profileUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  referralCode: string;
  storeId: string | null;
};

type UserRole = "USER" | "ADMIN" | "SUPERADMIN";
