import { Request, Response } from "express";
import {
  ACCESS_TOKEN_NAME,
  REFRESH_TOKEN_NAME,
  ACCESS_TOKEN_OPTIONS,
  REFRESH_TOKEN_OPTIONS,
} from "../../constant/cookies";
import { UnauthorizedError } from "../error/UnauthorizedError";
import { supabase } from "../lib/supabase/server";
import { prisma } from "../lib/db/prisma";

export class AuthService {
  static async getSession(req: Request, res: Response) {
    const accessToken = req.cookies[ACCESS_TOKEN_NAME];
    const refreshToken = req.cookies[REFRESH_TOKEN_NAME];

    if (!accessToken && !refreshToken) throw new UnauthorizedError();

    let userEmail: string | null = null;

    const { data: accessTokenData, error: accessTokenError } =
      await supabase.auth.getClaims(accessToken);

    if (accessTokenError || !accessTokenData) {
      const { data: refreshTokenData, error: refreshTokenError } =
        await supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });
      if (refreshTokenError || !refreshTokenData.session)
        throw new UnauthorizedError();
      res.cookie(
        ACCESS_TOKEN_NAME,
        refreshTokenData.session.access_token,
        ACCESS_TOKEN_OPTIONS
      );
      res.cookie(
        REFRESH_TOKEN_NAME,
        refreshTokenData.session.refresh_token,
        REFRESH_TOKEN_OPTIONS
      );

      if (!refreshTokenData.session.user.email) throw new UnauthorizedError();
      userEmail = refreshTokenData.session.user.email;
    } else {
      if (!accessTokenData.claims.email) throw new UnauthorizedError();
      userEmail = accessTokenData.claims.email;
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (!user) throw new UnauthorizedError();

    return { id: user.id, email: user.email, role: user.role };
  }
}
