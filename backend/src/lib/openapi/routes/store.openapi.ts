import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { registerRoute, createSuccessResponseSchema, commonResponses } from "../index";

extendZodWithOpenApi(z);

// GET /api/stores
registerRoute({
  method: "get",
  path: "/api/stores",
  tags: ["Stores"],
  summary: "List stores",
  description: "Retrieve stores with optional filters",
  request: { query: z.object({ name: z.string().optional(), city: z.string().optional() }) },
  responses: { 200: { description: "Stores", content: { "application/json": { schema: createSuccessResponseSchema(z.array(z.object({ id: z.string().uuid(), name: z.string(), addressName: z.string().optional(), postCode: z.string().optional() }))) } } }, ...commonResponses }
});

// GET /api/stores/{id}
registerRoute({
  method: "get",
  path: "/api/stores/{id}",
  tags: ["Stores"],
  summary: "Get store by ID",
  request: { params: z.object({ id: z.string().uuid().openapi({ param: { name: "id", in: "path" } }) }) },
  responses: { 200: { description: "Store detail", content: { "application/json": { schema: createSuccessResponseSchema(z.object({ id: z.string().uuid(), name: z.string(), addressName: z.string().optional(), latitude: z.number().optional(), longitude: z.number().optional() })) } } }, ...commonResponses }
});
