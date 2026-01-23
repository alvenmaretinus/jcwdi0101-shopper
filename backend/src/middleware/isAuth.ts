import { NextFunction, Request, Response } from "express";
import { InvalidTokenError } from "../error/InvalidTokenError";
import { auth } from "../lib/auth"; // your BetterAuth client
import { fromNodeHeaders } from "better-auth/node";
import { UserRole } from "../../prisma/generated/enums";
import { prisma } from "../lib/db/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session || !session.user) {
    throw new InvalidTokenError();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    throw new InvalidTokenError();
  }

  req.user = { id: user.id, email: user.email, role: user.role };
  next();
};
