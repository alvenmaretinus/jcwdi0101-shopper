/**
 * OpenAPI documentation for Product endpoints
 * Import this file early in your application to register product routes
 */

import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { registerRoute, createSuccessResponseSchema, commonResponses } from "../index";

// Extend Zod with OpenAPI methods
extendZodWithOpenApi(z);

/**
 * GET /api/products - Get products with filters
 */
registerRoute({
  method: "get",
  path: "/api/products",
  tags: ["Products"],
  summary: "Get products",
  description: "Retrieve products with optional filters (name, category, store)",
  request: {
    query: z.object({
      id: z.string().uuid().optional().openapi({
        description: "Filter by product ID",
      }),
      name: z.string().max(255).optional().openapi({
        description: "Filter by product name (partial match)",
      }),
      categoryId: z.string().uuid().optional().openapi({
        description: "Filter by category ID",
      }),
      storeId: z.string().uuid().optional().openapi({
        description: "Filter by store ID",
      }),
      withStock: z.boolean().optional().openapi({
        description: "Include stock information",
        default: false,
      }),
    }),
  },
  responses: {
    200: {
      description: "Products retrieved successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(
            z.array(
              z.object({
                id: z.string().uuid(),
                name: z.string(),
                description: z.string().nullable(),
                price: z.number(),
                weight: z.number(),
                imageUrls: z.array(z.string()),
                categoryId: z.string().uuid(),
                category: z.object({
                  id: z.string().uuid(),
                  category: z.string(),
                }),
                stock: z.number().int().optional(),
              })
            )
          ),
        },
      },
    },
    ...commonResponses,
  },
});

/**
 * GET /api/products/:id - Get product by ID
 */
registerRoute({
  method: "get",
  path: "/api/products/{id}",
  tags: ["Products"],
  summary: "Get product by ID",
  description: "Retrieve detailed information about a specific product",
  request: {
    params: z.object({
      id: z.string().uuid().openapi({
        param: {
          name: "id",
          in: "path",
        },
        example: "550e8400-e29b-41d4-a716-446655440000",
      }),
    }),
  },
  responses: {
    200: {
      description: "Product retrieved successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(
            z.object({
              id: z.string().uuid(),
              name: z.string(),
              description: z.string().nullable(),
              price: z.number(),
              weight: z.number(),
              imageUrls: z.array(z.string()),
              categoryId: z.string().uuid(),
              category: z.object({
                id: z.string().uuid(),
                category: z.string(),
              }),
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
 * POST /api/products - Create product (Admin only)
 */
registerRoute({
  method: "post",
  path: "/api/products",
  tags: ["Products"],
  summary: "Create product",
  description: "Create a new product (Super Admin only)",
  security: [{ BearerAuth: [] }],
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().min(1).max(255),
            description: z.string().optional(),
            price: z.number().positive(),
            weight: z.number().positive(),
            categoryId: z.string().uuid(),
            imageUrls: z.array(z.string().url()).optional(),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Product created successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(
            z.object({
              id: z.string().uuid(),
              name: z.string(),
              description: z.string().nullable(),
              price: z.number(),
              weight: z.number(),
              categoryId: z.string().uuid(),
              imageUrls: z.array(z.string()),
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
 * PATCH /api/products/:id - Update product (Admin only)
 */
registerRoute({
  method: "patch",
  path: "/api/products/{id}",
  tags: ["Products"],
  summary: "Update product",
  description: "Update an existing product (Super Admin only)",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid().openapi({
        param: {
          name: "id",
          in: "path",
        },
      }),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().min(1).max(255).optional(),
            description: z.string().optional(),
            price: z.number().positive().optional(),
            weight: z.number().positive().optional(),
            categoryId: z.string().uuid().optional(),
            imageUrls: z.array(z.string().url()).optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Product updated successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(
            z.object({
              id: z.string().uuid(),
              name: z.string(),
              description: z.string().nullable(),
              price: z.number(),
              weight: z.number(),
              categoryId: z.string().uuid(),
              imageUrls: z.array(z.string()),
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
 * DELETE /api/products/:id - Delete product (Admin only)
 */
registerRoute({
  method: "delete",
  path: "/api/products/{id}",
  tags: ["Products"],
  summary: "Delete product",
  description: "Delete a product (Super Admin only)",
  security: [{ BearerAuth: [] }],
  request: {
    params: z.object({
      id: z.string().uuid().openapi({
        param: {
          name: "id",
          in: "path",
        },
      }),
    }),
  },
  responses: {
    204: {
      description: "Product deleted successfully",
    },
    ...commonResponses,
  },
});
