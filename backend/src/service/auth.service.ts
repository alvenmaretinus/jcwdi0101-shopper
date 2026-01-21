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
import { SignupInput } from "../schema/auth/SignupSchema";
import { ConflictError } from "../error/ConflictError";
import { CallbackInput } from "../schema/auth/CallbackSchema";

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

  static async signup(data: SignupInput) {
    const { email, password } = data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const { data } = await supabase.auth.admin.getUserById(user.id);
      const supabaseUser = data.user;
      if (supabaseUser && !supabaseUser.email_confirmed_at) {
        const now = new Date();
        const verificationExpiry = new Date(user.createdAt);
        verificationExpiry.setHours(verificationExpiry.getHours() + 1);
        const isVerificationLinkExpired = now > verificationExpiry;
        if (!isVerificationLinkExpired) {
          throw new ConflictError(
            "You already signing up. Check your email for the verification link, or signup again after 1hours from the initial signup."
          );
        }

        const { error } = await supabase.auth.admin.deleteUser(supabaseUser.id);
        if (error) throw error;
        await prisma.user.delete({ where: { id: user.id } });
      } else {
        throw new ConflictError("Email already exists");
      }
    }

    const {
      error,
      data: { user: supabaseUser },
    } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error || !supabaseUser) throw error;

    await prisma.user.create({
      data: { email, role: "USER", id: supabaseUser.id },
    });
  }

  static async callback(inputData: CallbackInput, res: Response) {
    const { accessToken, refreshToken } = inputData;
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      console.error("Auth check failed:", error);
      throw new UnauthorizedError();
    }

    const user = await prisma.user.findUnique({ where: { id: data.user.id } });
    if (!user) {
      await prisma.user.create({
        data: { email: data.user.email!, role: "USER", id: data.user.id },
      });
    }
    res.cookie(ACCESS_TOKEN_NAME, accessToken, ACCESS_TOKEN_OPTIONS);
    res.cookie(REFRESH_TOKEN_NAME, refreshToken, REFRESH_TOKEN_OPTIONS);
  }
}
