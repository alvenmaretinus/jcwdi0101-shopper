import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { registerRoute, createSuccessResponseSchema, commonResponses } from "../index";

extendZodWithOpenApi(z);

// GET /api/users - list users (admin)
registerRoute({
  method: "get",
  path: "/api/users",
  tags: ["Users"],
  summary: "List users",
  security: [{ BearerAuth: [] }],
  request: { query: z.object({ page: z.number().int().optional(), limit: z.number().int().optional() }) },
  responses: { 200: { description: "Users list", content: { "application/json": { schema: createSuccessResponseSchema(z.object({ total: z.number().int(), items: z.array(z.object({ id: z.string().uuid(), email: z.string().email(), name: z.string().optional() })) })) } } }, ...commonResponses }
});

// GET /api/users/{id}
registerRoute({
  method: "get",
  path: "/api/users/{id}",
  tags: ["Users"],
  summary: "Get user by ID",
  security: [{ BearerAuth: [] }],
  request: { params: z.object({ id: z.string().uuid().openapi({ param: { name: "id", in: "path" } }) }) },
  responses: { 200: { description: "User detail", content: { "application/json": { schema: createSuccessResponseSchema(z.object({ id: z.string().uuid(), email: z.string().email(), name: z.string().optional(), createdAt: z.string().datetime() })) } } }, ...commonResponses }
});
