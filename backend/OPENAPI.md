# OpenAPI / Swagger Documentation

This project uses `@asteasolutions/zod-to-openapi` to automatically generate OpenAPI documentation from your existing Zod schemas.

## Access the Documentation

Once the server is running, visit:

- **Swagger UI**: `http://localhost:3001/api/docs`
- **OpenAPI JSON**: `http://localhost:3001/api/docs/openapi.json`

## How to Document New Endpoints

### 1. Create a route documentation file

Create a new file in `src/lib/openapi/routes/` for your endpoint group:

```typescript
// src/lib/openapi/routes/myroute.openapi.ts
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { registerRoute, createSuccessResponseSchema, commonResponses } from "../lib/openapi";
import { MyRequestSchema } from "../schema/myroute/MyRequestSchema";

// Extend Zod with OpenAPI methods (required once per file)
extendZodWithOpenApi(z);

/**
 * GET /api/myroute - Get my resource
 */
registerRoute({
  method: "get",
  path: "/api/myroute",
  tags: ["MyRoute"],
  summary: "Get my resource",
  description: "Retrieve my resource with optional filters",
  security: [{ BearerAuth: [] }], // Add if authentication required
  request: {
    query: z.object({
      id: z.string().uuid().optional().openapi({
        description: "Filter by ID",
        example: "550e8400-e29b-41d4-a716-446655440000",
      }),
    }),
  },
  responses: {
    200: {
      description: "Resource retrieved successfully",
      content: {
        "application/json": {
          schema: createSuccessResponseSchema(
            z.object({
              id: z.string().uuid(),
              name: z.string(),
            })
          ),
        },
      },
    },
    ...commonResponses, // Include standard error responses
  },
});
```

### 2. Import the route documentation

Import your new route documentation file in `src/route/docs.route.ts`:

```typescript
import "../lib/openapi/routes/myroute.openapi";
```

### 3. Restart the server

The documentation will be automatically generated and available at `/api/docs`.

## Route Configuration Options

### Request body

```typescript
request: {
  body: {
    content: {
      "application/json": {
        schema: MyZodSchema,
      },
    },
  },
}
```

### Path parameters

```typescript
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
}
```

### Query parameters

```typescript
request: {
  query: z.object({
    page: z.number().int().min(1).optional().openapi({
      description: "Page number for pagination",
      default: 1,
    }),
    limit: z.number().int().min(1).max(100).optional().openapi({
      description: "Items per page",
      default: 10,
    }),
  }),
}
```

### Authentication

Add security to require authentication:

```typescript
security: [{ BearerAuth: [] }], // JWT Bearer token
// or
security: [{ ApiKeyAuth: [] }], // API Key in header
```

### Response schemas

Use the helper for success responses:

```typescript
responses: {
  200: {
    description: "Success message",
    content: {
      "application/json": {
        schema: createSuccessResponseSchema(YourDataSchema),
      },
    },
  },
  ...commonResponses, // Includes 400, 401, 403, 404, 500
}
```

## Examples

See these files for complete examples:
- `src/lib/openapi/routes/cart.openapi.ts` - Cart endpoints with authentication
- `src/lib/openapi/routes/product.openapi.ts` - Product CRUD endpoints

## Tags

Available tags for grouping endpoints:
- `Cart`
- `Products`
- `Orders`
- `Stores`
- `Users`
- `Discounts`
- `Vouchers`
- `Auth`

Add new tags in `src/lib/openapi/registry.ts` if needed.

## Benefits

✅ **Auto-generated** from existing Zod schemas
✅ **Type-safe** - schemas match your validation
✅ **Interactive** UI with Swagger
✅ **Easy to maintain** - update once, docs update automatically
✅ **Client generation** - export OpenAPI JSON for codegen tools
