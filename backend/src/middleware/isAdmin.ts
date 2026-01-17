import { UnauthorizedError } from "../error/UnauthorizedError";
import { NextFunction, Request, Response } from "express";
import { UserRole } from "../../prisma/generated/enums";

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user!;
  const isAdmin =
    user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN;

  if (!isAdmin) throw new UnauthorizedError("Admin access required");

  next();
};
