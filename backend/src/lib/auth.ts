import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db/prisma";
import { LRUCache } from "lru-cache";
import { sendEmailVerification, sendResetPasswordEmail } from "./email/mailer";
import { BadRequestError } from "../error/BadRequestError";

const _rateLimit = new LRUCache<string, { email: string; lastRequest: Date }>({
  ttl: 1000 * 60, // reset limit every 60 sec
  sizeCalculation: () => 1,
  maxSize: 5000,
});

/**
 * Check if user is an OAuth user (has linked OAuth accounts)
 * Returns true if user has OAuth accounts (google, etc.)
 */
async function isOAuthUser(userId: string): Promise<boolean> {
  const accounts = await prisma.account.findMany({
    where: { userId },
  });
  // If user has accounts with providers other than "credential", they're OAuth
  return accounts.some(
    (account) => account.providerId && account.providerId !== "credential",
  );
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    changeEmail: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 100,
    sendResetPassword: async ({ user, token }) => {
      // Check if user is OAuth user - prevent password reset for OAuth users
      const hasOAuthAccount = await isOAuthUser(user.id);
      if (hasOAuthAccount) {
        // Don't send reset email for OAuth users
        // They should use their OAuth provider to manage password
        console.warn(
          `OAuth user ${user.email} attempted to reset password. Ignoring.`,
        );
        throw new BadRequestError(
          "OAuth users cannot reset password. Please use your OAuth provider.",
        );
      }

      const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
      sendResetPasswordEmail({
        email: user.email,
        subject: "Reset your password",
        text: "Click the link to reset your password.",
        url,
      });
    },
  },
  trustedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim())
    : [process.env.CLIENT_URL || "http://localhost:3000", "http://localhost:3001"],
  socialProviders: {
    google:
      process.env.GOOGLE_CLIENT && process.env.GOOGLE_SECRET
        ? {
            clientId: process.env.GOOGLE_CLIENT,
            clientSecret: process.env.GOOGLE_SECRET,
          }
        : undefined,
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token: _token }, _request) => {
      // TODO: uncomment in prod
      // const record = rateLimit.get(user.email);
      // if (record)
      //   throw new AppError({
      //     statusCode: 429,
      //     message: "Too many requests, please try again later.",
      //   });
      // rateLimit.set(user.email, { email: user.email, lastRequest: new Date() });
      sendEmailVerification({
        email: user.email,
        url,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
      });
    },
  },
});
