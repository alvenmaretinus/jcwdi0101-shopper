import { UnauthorizedError } from "../error/UnauthorizedError";
import { NextFunction, Request, Response } from "express";
import { UserRole } from "../../prisma/generated/enums";

export const isSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user!;
  const isSuperAdmin = user.role === UserRole.SUPERADMIN;

  if (!isSuperAdmin) throw new UnauthorizedError("Super Admin access required");

  next();
};
