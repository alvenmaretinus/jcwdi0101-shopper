import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { registerRoute, createSuccessResponseSchema, commonResponses } from "../index";

extendZodWithOpenApi(z);

// GET /api/orders - list orders (role-based in implementation)
registerRoute({
  method: "get",
  path: "/api/orders",
  tags: ["Orders"],
  summary: "List orders",
  description: "Retrieve orders with optional filters (status, date range, store)",
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({
      page: z.number().int().min(1).optional().openapi({ default: 1 }),
      limit: z.number().int().min(1).max(100).optional().openapi({ default: 10 }),
      status: z.string().optional(),
      storeId: z.string().uuid().optional(),
    }),
  },
  responses: {
    200: {
      description: "Orders list",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(z.object({
            total: z.number().int(),
            items: z.array(z.object({
              id: z.string().uuid(),
              subtotal: z.number(),
              shippingCost: z.number(),
              totalDiscount: z.number(),
              grandTotal: z.number(),
              status: z.string(),
              createdAt: z.string().datetime(),
            }))
          }))
        }
      }
    },
    ...commonResponses
  }
});

// GET /api/orders/{id}
registerRoute({
  method: "get",
  path: "/api/orders/{id}",
  tags: ["Orders"],
  summary: "Get order by ID",
  description: "Retrieve detailed order information",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({ id: z.string().uuid().openapi({ param: { name: "id", in: "path" } }) })
  },
  responses: {
    200: {
      description: "Order details",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(z.object({
            id: z.string().uuid(),
            userId: z.string().uuid(),
            storeId: z.string().uuid().nullable(),
            subtotal: z.number(),
            shippingCost: z.number(),
            totalDiscount: z.number(),
            grandTotal: z.number(),
            status: z.string(),
            items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int(), unitPrice: z.number() })),
          }))
        }
      }
    },
    ...commonResponses
  }
});

// POST /api/orders - create pending order
registerRoute({
  method: "post",
  path: "/api/orders",
  tags: ["Orders"],
  summary: "Create pending order (checkout)",
  description: "Create a pending order from the authenticated user's cart",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            addressId: z.string().uuid(),
            paymentType: z.enum(["BANK_TRANSFER","PAYMENT_GATEWAY"]).optional(),
            voucherIds: z.array(z.string().uuid()).optional(),
            discountIds: z.array(z.string().uuid()).optional(),
          })
        }
      }
    }
  },
  responses: {
    201: {
      description: "Order created",
      content: { "application/json": { schema: createSuccessResponseSchema(z.object({ id: z.string().uuid() })) } }
    },
    ...commonResponses
  }
});
