import { ACCESS_TOKEN_NAME } from "../../constant/cookies";
import { UserRole } from "../../prisma/generated/enums";
import { InvalidTokenError } from "../error/InvalidTokenError";
import { prisma } from "../lib/db/prisma";
import { supabase } from "../lib/supabase/server";
import { NextFunction, Request, Response } from "express";

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
  const accessToken = req.cookies[ACCESS_TOKEN_NAME];
  if (!accessToken) {
    console.info("No access token provided from isAuth");
    throw new InvalidTokenError();
  }
  const {
    data: { user: supabaseUser },
    error,
  } = await supabase.auth.getUser(accessToken);
  if (error || !supabaseUser) {
    console.info("Invalid token from isAuth");
    throw new InvalidTokenError();
  }

  const user = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
  });
  if (!user) {
    console.info("User not found from isAuth");
    throw new InvalidTokenError();
  }
  req.user = { id: user.id, email: user.email, role: user.role };

  next();
};
