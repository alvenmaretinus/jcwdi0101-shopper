export type User = {
  email: string;
  id: string;
  name: string;
  role: UserRole;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  referralCode: string;
  referredById: string | null;
  storeId: string | null;
  employeeJoinedAt: string | null;
};

type UserRole = "USER" | "ADMIN" | "SUPERADMIN";
