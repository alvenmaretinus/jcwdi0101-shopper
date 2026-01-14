import { AppError } from "../error/AppError";
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
} from "@prisma/client/runtime/client";
import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

const isPrismaError = (
  err: unknown
): err is
  | PrismaClientKnownRequestError
  | PrismaClientUnknownRequestError
  | PrismaClientRustPanicError
  | PrismaClientInitializationError
  | PrismaClientValidationError => {
  return (
    err instanceof PrismaClientKnownRequestError ||
    err instanceof PrismaClientUnknownRequestError ||
    err instanceof PrismaClientRustPanicError ||
    err instanceof PrismaClientInitializationError ||
    err instanceof PrismaClientValidationError
  );
};

export const errorHandler = (
  err: ErrorRequestHandler,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    console.log("AppError: " + err.message);
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof ZodError) {
    const message = err.message;
    console.log("ZodError: " + message);
    return res.status(400).json({ error: "Bad Request" });
  }

  if (isPrismaError(err)) {
    console.log("PrismaError: " + err.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }

  console.error("UnknownError: " + err);
  return res.status(500).json({ error: "Internal server error" });
};
