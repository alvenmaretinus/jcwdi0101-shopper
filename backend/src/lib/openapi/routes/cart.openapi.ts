/**
 * OpenAPI documentation for Cart endpoints
 * Import this file early in your application to register cart routes
 */

import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { registerRoute, createSuccessResponseSchema, commonResponses } from "../index";
import { AddToCartSchema } from "../../../schema/cart/AddToCartSchema";

// Extend Zod with OpenAPI methods
extendZodWithOpenApi(z);

/**
 * POST /api/cart - Add item to cart
 */
registerRoute({
  method: "post",
  path: "/api/cart",
  tags: ["Cart"],
  summary: "Add item to cart",
  description: "Add a product to the user's shopping cart",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: AddToCartSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Item added to cart successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(
            z.object({
              id: z.string().uuid(),
              cartId: z.string().uuid(),
              productId: z.string().uuid(),
              quantity: z.number().int(),
              createdAt: z.string().datetime(),
              updatedAt: z.string().datetime(),
            })
          ),
        },
      },
    },
    ...commonResponses,
  },
});

/**
 * GET /api/cart - Get user's cart
 */
registerRoute({
  method: "get",
  path: "/api/cart",
  tags: ["Cart"],
  summary: "Get user's cart",
  description: "Retrieve the authenticated user's shopping cart with items, pricing, and stock information",
  security: [{ BearerAuth: [] }],
  request: {
    query: z.object({
      storeId: z.string().uuid().optional().openapi({
        description: "Optional store ID to check stock availability",
        example: "550e8400-e29b-41d4-a716-446655440000",
      }),
      discountIds: z.array(z.string().uuid()).optional().openapi({
        description: "Array of discount IDs to apply",
      }),
      voucherIds: z.array(z.string().uuid()).optional().openapi({
        description: "Array of voucher IDs to apply",
      }),
    }),
  },
  responses: {
    200: {
      description: "Cart retrieved successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(
            z.object({
              cartId: z.string().uuid().nullable(),
              cartItems: z.array(
                z.object({
                  id: z.string().uuid(),
                  productId: z.string().uuid(),
                  quantity: z.number().int(),
                  stockQuantity: z.number().int(),
                  productTotal: z.number().int(),
                  outOfStock: z.boolean(),
                  canAddToCart: z.boolean(),
                  product: z.object({
                    id: z.string().uuid(),
                    name: z.string(),
                    price: z.number(),
                    imageUrls: z.array(z.string()),
                  }),
                })
              ),
              pricing: z.object({
                subtotal: z.number(),
                totalDiscount: z.number(),
                shippingCost: z.number(),
                grandTotal: z.number(),
              }),
            })
          ),
        },
      },
    },
    ...commonResponses,
  },
});

/**
 * PATCH /api/cart - Update cart item quantity
 */
registerRoute({
  method: "patch",
  path: "/api/cart",
  tags: ["Cart"],
  summary: "Update cart item quantity",
  description: "Update the quantity of an item in the cart. Set quantity to 0 to remove the item.",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: AddToCartSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Cart item updated successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(
            z.object({
              id: z.string().uuid(),
              cartId: z.string().uuid(),
              productId: z.string().uuid(),
              quantity: z.number().int(),
              updatedAt: z.string().datetime(),
            })
          ),
        },
      },
    },
    ...commonResponses,
  },
});

/**
 * DELETE /api/cart/:productId - Remove item from cart
 */
registerRoute({
  method: "delete",
  path: "/api/cart/{productId}",
  tags: ["Cart"],
  summary: "Remove item from cart",
  description: "Remove a specific product from the user's cart",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      productId: z.string().uuid().openapi({
        param: {
          name: "productId",
          in: "path",
        },
        example: "550e8400-e29b-41d4-a716-446655440000",
      }),
    }),
  },
  responses: {
    200: {
      description: "Item removed from cart successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(z.object({})),
        },
      },
    },
    ...commonResponses,
  },
});
