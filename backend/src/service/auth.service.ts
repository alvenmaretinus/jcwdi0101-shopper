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
import { LoginInput } from "../schema/auth/LoginSchema";

export class AuthService {
  static async signup(inputData: SignupInput) {
    const { email, password } = inputData;
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

  static async login(inputData: LoginInput, res: Response) {
    const { email, password } = inputData;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const {
      data: { user: supabaseUser },
    } = await supabase.auth.admin.getUserById(user.id);
    if (!supabaseUser || !supabaseUser.email_confirmed_at) {
      throw new UnauthorizedError(
        "Please verify your email address first, by clicking on the verification link sent to your email"
      );
    }

    const {
      data: { session },
      error,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !session) {
      throw new UnauthorizedError("Invalid credentials");
    }

    res.cookie(ACCESS_TOKEN_NAME, session.access_token, ACCESS_TOKEN_OPTIONS);
    res.cookie(
      REFRESH_TOKEN_NAME,
      session.refresh_token,
      REFRESH_TOKEN_OPTIONS
    );
  }

  static async callback(inputData: CallbackInput, res: Response) {
    const { accessToken, refreshToken } = inputData;
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      console.error("Callback error:", error);
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

  static async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies[REFRESH_TOKEN_NAME];
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });
    if (error || !data.session) throw new UnauthorizedError("Invalid Token");
    res.cookie(
      ACCESS_TOKEN_NAME,
      data.session.access_token,
      ACCESS_TOKEN_OPTIONS
    );
    res.cookie(
      REFRESH_TOKEN_NAME,
      data.session.refresh_token,
      REFRESH_TOKEN_OPTIONS
    );
  }
}
