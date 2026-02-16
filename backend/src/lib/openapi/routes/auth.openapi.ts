import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { registerRoute, createSuccessResponseSchema, commonResponses } from "../index";

extendZodWithOpenApi(z);

// POST /api/auth/login
registerRoute({
  method: "post",
  path: "/api/auth/login",
  tags: ["Auth"],
  summary: "Login",
  request: { body: { content: { "application/json": { schema: z.object({ email: z.string().email(), password: z.string() }) } } } },
  responses: { 200: { description: "Login successful", content: { "application/json": { schema: createSuccessResponseSchema(z.object({ token: z.string(), user: z.object({ id: z.string().uuid(), email: z.string().email() }) })) } } }, ...commonResponses }
});

// POST /api/auth/register
registerRoute({
  method: "post",
  path: "/api/auth/register",
  tags: ["Auth"],
  summary: "Register",
  request: { body: { content: { "application/json": { schema: z.object({ email: z.string().email(), password: z.string(), name: z.string().optional() }) } } } },
  responses: { 201: { description: "User registered", content: { "application/json": { schema: createSuccessResponseSchema(z.object({ id: z.string().uuid(), email: z.string().email() })) } } }, ...commonResponses }
});

// GET /api/auth/me
registerRoute({
  method: "get",
  path: "/api/auth/me",
  tags: ["Auth"],
  security: [{ BearerAuth: [] }],
  summary: "Get current user",
  responses: { 200: { description: "Current user", content: { "application/json": { schema: createSuccessResponseSchema(z.object({ id: z.string().uuid(), email: z.string().email(), name: z.string().optional() })) } } }, ...commonResponses }
});
