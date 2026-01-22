import { CookieOptions } from "express";

export const REFRESH_TOKEN_NAME = "refresh_token";
export const ACCESS_TOKEN_NAME = "access_token";
export const REFRESH_TOKEN_EXPIRES = 30 * 24 * 60 * 60; // in seconds, 30 days
export const ACCESS_TOKEN_EXPIRES = 60 * 60; // in seconds, 60 minutes

export const isProduction = process.env.NODE_ENV === "production";

export const REFRESH_TOKEN_OPTIONS = {
  httpOnly: isProduction ? true : false,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "none",
  path: isProduction ? "/api/auth/refresh" : "/",
  expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRES * 1000),
} satisfies CookieOptions;

export const ACCESS_TOKEN_OPTIONS = {
  httpOnly: isProduction ? true : false,
  secure: isProduction,
  sameSite: isProduction ? "strict" : "none",
  path: isProduction ? "/api" : "/",
  expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRES * 1000),
} satisfies CookieOptions;
