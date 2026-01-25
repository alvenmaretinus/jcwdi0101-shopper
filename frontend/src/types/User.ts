export type User = {
  email: string;
  id: string;
  role: UserRole;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  referralCode: string;
  storeId: string | null;
  employeeJoinedAt: string | null;
};

type UserRole = "USER" | "ADMIN" | "SUPERADMIN";
