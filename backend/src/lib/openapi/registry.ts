import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";

/**
 * Central OpenAPI registry for all API endpoints
 * Use this to register all routes with their schemas
 */
export const registry = new OpenAPIRegistry();

/**
 * Register common components (auth, errors, etc.)
 */

// Common error response schema
registry.registerComponent("schemas", "ErrorResponse", {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    message: { type: "string", example: "Error message" },
    error: { type: "string", example: "Error details" },
  },
  required: ["success", "message"],
});

// Common success response wrapper
registry.registerComponent("schemas", "SuccessResponse", {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    message: { type: "string", example: "Success message" },
    data: { type: "object" },
  },
  required: ["success", "message"],
});

// Security schemes
registry.registerComponent("securitySchemes", "BearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
  description: "JWT token from better-auth session",
});

registry.registerComponent("securitySchemes", "ApiKeyAuth", {
  type: "apiKey",
  in: "header",
  name: "x-api-key",
  description: "API key for backend service authentication",
});

/**
 * Generate OpenAPI document
 */
export function generateOpenAPIDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "Shopper API",
      version: "1.0.0",
      description: "E-commerce API with multi-store inventory management",
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:3001/api",
        description: "API Server",
      },
    ],
    tags: [
      { name: "Cart", description: "Shopping cart operations" },
      { name: "Products", description: "Product catalog and management" },
      { name: "Orders", description: "Order processing and tracking" },
      { name: "Stores", description: "Store and inventory management" },
      { name: "Users", description: "User account management" },
      { name: "Discounts", description: "Discount and promotion management" },
      { name: "Vouchers", description: "Voucher management" },
      { name: "Auth", description: "Authentication endpoints" },
    ],
  });
}
