import { UserRole } from "../../../prisma/generated/enums";

export {};


interface UserPayload {
  id: string;
  email: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
