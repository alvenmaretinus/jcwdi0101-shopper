import { RouteConfig } from "@asteasolutions/zod-to-openapi";
import { registry } from "./registry";
import { z } from "zod";

/**
 * Helper to register a route with OpenAPI documentation
 * @param config Route configuration with method, path, schemas, etc.
 */
export function registerRoute(config: RouteConfig) {
  registry.registerPath(config);
}

/**
 * Create a standardized success response schema
 */
export function createSuccessResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  });
}

/**
 * Create a standardized error response schema
 */
export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  error: z.string().optional(),
});

/**
 * Common response types for reuse
 */
export const commonResponses = {
  400: {
    description: "Bad Request",
    content: {
      "application/json": {
        schema: errorResponseSchema,
      },
    },
  },
  401: {
    description: "Unauthorized",
    content: {
      "application/json": {
        schema: errorResponseSchema,
      },
    },
  },
  403: {
    description: "Forbidden",
    content: {
      "application/json": {
        schema: errorResponseSchema,
      },
    },
  },
  404: {
    description: "Not Found",
    content: {
      "application/json": {
        schema: errorResponseSchema,
      },
    },
  },
  500: {
    description: "Internal Server Error",
    content: {
      "application/json": {
        schema: errorResponseSchema,
      },
    },
  },
};
