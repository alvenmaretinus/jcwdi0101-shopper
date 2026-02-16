import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { registerRoute, createSuccessResponseSchema, commonResponses } from "../index";

extendZodWithOpenApi(z);

// GET /api/vouchers
registerRoute({
  method: "get",
  path: "/api/vouchers",
  tags: ["Vouchers"],
  summary: "List vouchers",
  request: { query: z.object({ code: z.string().optional(), active: z.boolean().optional() }) },
  responses: { 200: { description: "Vouchers list", content: { "application/json": { schema: createSuccessResponseSchema(z.array(z.object({ id: z.string().uuid(), code: z.string(), discountId: z.string().nullable(), createdAt: z.string().datetime() }))) } } }, ...commonResponses }
});

// GET /api/vouchers/{id}
registerRoute({
  method: "get",
  path: "/api/vouchers/{id}",
  tags: ["Vouchers"],
  summary: "Get voucher by ID",
  request: { params: z.object({ id: z.string().uuid().openapi({ param: { name: "id", in: "path" } }) }) },
  responses: { 200: { description: "Voucher detail", content: { "application/json": { schema: createSuccessResponseSchema(z.object({ id: z.string().uuid(), code: z.string(), discountId: z.string().nullable(), expiresAt: z.string().nullable() })) } } }, ...commonResponses }
});
