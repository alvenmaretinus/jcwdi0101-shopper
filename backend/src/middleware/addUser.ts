import { UnauthorizedError } from "../error/UnauthorizedError";
import { prisma } from "../lib/db/prisma";
import { supabase } from "../lib/supabase/server";
import { NextFunction, Request, Response } from "express";


// adds the user to req if a valid token is provided, otherwise continues without error
export const addUser = async (
  req: Request,
  res: Response,
    next: NextFunction,
) => {
  const accessToken = req.cookies["sb-access-token"];
    if (!accessToken) {
        return next();
    }

  const {
    data: { user: supabaseUser },
    error,
  } = await supabase.auth.getUser(accessToken);
    if (error || !supabaseUser) {
        return next();
    }
    const user = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
  });
    if (!user) {
        return next();
    }
    req.user = { id: user.id, email: user.email!, role: user.role };

  next();
}
