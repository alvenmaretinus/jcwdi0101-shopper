export type UserPayload = {
  id: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
};
