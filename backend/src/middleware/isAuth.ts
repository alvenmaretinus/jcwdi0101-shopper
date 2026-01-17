import { UnauthorizedError } from "../error/UnauthorizedError";
import { prisma } from "../lib/db/prisma";
import { supabase } from "../lib/supabase/server";
import { NextFunction, Request, Response } from "express";

export const isAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies["sb-access-token"];
  if (!accessToken) throw new UnauthorizedError("No access token provided");

  const {
    data: { user: supabaseUser },
    error,
  } = await supabase.auth.getUser(accessToken);
  if (error || !supabaseUser) throw new UnauthorizedError("Invalid token");

  const user = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
  });
  if (!user) throw new UnauthorizedError("User not found");

  req.user = { id: user.id, email: user.email!, role: user.role };

  next();
};
