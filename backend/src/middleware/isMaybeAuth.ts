import { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth"; // your BetterAuth client
import { fromNodeHeaders } from "better-auth/node";
import { prisma } from "../lib/db/prisma";


export const isMaybeAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session || !session.user) {
    next()
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    next()
    return;
  }

  req.user = {
    id: user.id,
    email: user.email,
    role: user.role,
    storeId: user.storeId,
  };
  next();
};