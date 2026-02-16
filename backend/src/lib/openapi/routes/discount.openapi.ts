import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { registerRoute, createSuccessResponseSchema, commonResponses } from "../index";

extendZodWithOpenApi(z);

// GET /api/discounts
registerRoute({
  method: "get",
  path: "/api/discounts",
  tags: ["Discounts"],
  summary: "List discounts",
  request: { query: z.object({ productId: z.string().uuid().optional(), activeOnDate: z.string().datetime().optional() }) },
  responses: { 200: { description: "Discounts list", content: { "application/json": { schema: createSuccessResponseSchema(z.array(z.object({ id: z.string().uuid(), name: z.string().nullable(), percentage: z.number().nullable(), amount: z.number().nullable(), type: z.string() }))) } } }, ...commonResponses }
});

// GET /api/discounts/{id}
registerRoute({
  method: "get",
  path: "/api/discounts/{id}",
  tags: ["Discounts"],
  summary: "Get discount by ID",
  request: { params: z.object({ id: z.string().uuid().openapi({ param: { name: "id", in: "path" } }) }) },
  responses: { 200: { description: "Discount detail", content: { "application/json": { schema: createSuccessResponseSchema(z.object({ id: z.string().uuid(), name: z.string().nullable(), percentage: z.number().nullable(), amount: z.number().nullable(), type: z.string(), startsAt: z.string().nullable(), endsAt: z.string().nullable() })) } } }, ...commonResponses }
});
