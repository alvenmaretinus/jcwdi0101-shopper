import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db/prisma";
import { LRUCache } from "lru-cache";
import { sendEmailVerification } from "./email/mailer";
import { AppError } from "../error/AppError";

const rateLimit = new LRUCache<string, { email: string; lastRequest: Date }>({
  max: 5000, // max 5000 IPs tracked
  ttl: 1000 * 60, // reset counts every 60 sec
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  trustedOrigins: [process.env.CLIENT_URL || "http://localhost:3000"],
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
    sendVerificationEmail: async ({ user, url, token }, request) => {
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
