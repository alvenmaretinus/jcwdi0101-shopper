import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { generateOpenAPIDocument } from "../lib/openapi";

// Import route documentation to register them
import "../lib/openapi/routes/cart.openapi";
import "../lib/openapi/routes/product.openapi";
import "../lib/openapi/routes/order.openapi";
import "../lib/openapi/routes/store.openapi";
import "../lib/openapi/routes/user.openapi";
import "../lib/openapi/routes/discount.openapi";
import "../lib/openapi/routes/voucher.openapi";
import "../lib/openapi/routes/auth.openapi";

const router = Router();

// Generate OpenAPI document
const openApiDocument = generateOpenAPIDocument();

// Serve Swagger UI
router.use("/", swaggerUi.serve);
router.get("/", swaggerUi.setup(openApiDocument, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Shopper API Documentation",
}));

// Serve OpenAPI JSON spec
router.get("/openapi.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(openApiDocument);
});

export default router;
