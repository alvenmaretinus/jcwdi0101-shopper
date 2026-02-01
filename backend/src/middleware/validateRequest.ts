import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import { BadRequestError } from "../error/BadRequestError";

type ValidateTarget = "body" | "params" | "query";

export const validateRequest =
  (schema: ZodType, target: ValidateTarget = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsedData = schema.parse(req[target]);

      req[target] = parsedData;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues.map((issues) => issues.message).join(", ");

        return next(new BadRequestError(message));
      }

      next(error);
    }
  };
