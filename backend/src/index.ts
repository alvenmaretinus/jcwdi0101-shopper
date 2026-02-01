import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";
import { appRouter } from "./route";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cron from "node-cron";
import { OrderService } from "./service/order.service";

const isProduction = process.env.NODE_ENV === "production";
const requiredEnvVars = ["MIDTRANS_SERVER_KEY", "MIDTRANS_CLIENT_KEY", "BANK_ACCOUNT_NUMBER", "BANK_ACCOUNT_HOLDER", "KOMERCE_API_KEY"];

if (isProduction) {
  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  if (missingVars.length > 0) {
    console.error(`❌ FATAL: Missing required environment variables in production: ${missingVars.join(", ")}`);
    console.error("Please configure all required env vars in .env file");
    process.exit(1);
  }
  console.log("✅ All required payment environment variables loaded for production");
} else {
  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  if (missingVars.length > 0) {
    console.warn(`⚠️  Warning: Missing environment variables in ${process.env.NODE_ENV || "development"} mode: ${missingVars.join(", ")}`);
    console.warn("   Payment features may not work. Configure .env file if needed.");
  } else {
    console.log("✅ All required payment environment variables loaded");
  }
}

const app = express();
const port = process.env.PORT! || 3001;
const clientUrl = process.env.CLIENT_URL!;

app.use(
  cors({
    origin: clientUrl || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }),
);

// Serve uploaded files (payment proofs, etc.) at /uploads path (protected with API key)
const uploadsAuthMiddleware: express.RequestHandler = (req, res, next) => {
  // Allow authentication via x-api-key header for programmatic access
  const apiKey = req.header("x-api-key");
  const kommerceApiKey = process.env.KOMERCE_API_KEY;

  // Allow authenticated users via session
  if (req.user) {
    return next();
  }

  // Allow API key based access (e.g., for webhooks or backend services)
  if (apiKey && kommerceApiKey && apiKey === kommerceApiKey) {
    return next();
  }

  // Deny access
  return res.status(401).json({ error: "Unauthorized access to uploads. Provide valid authentication or x-api-key header." });
};
app.use("/uploads", uploadsAuthMiddleware, express.static("uploads"));

app.all("/api/auth/*splat", toNodeHandler(auth));

// Parse JSON bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

app.use("/api", appRouter);
// Global error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);

  // Initialize cron jobs after server is ready
  console.log("Initializing scheduled tasks...");

  // Auto-expire pending orders every hour
  cron.schedule("0 * * * *", async () => {
    try {
      await OrderService.expirePendingOrders();
    } catch (err) {
      console.error("[Cron] Error expiring pending orders:", err);
    }
  });

  // Auto-confirm orders 2 days after shipping (check every 6 hours)
  cron.schedule("0 */6 * * *", async () => {
    try {
      await OrderService.autoConfirmOrders();
    } catch (err) {
      console.error("[Cron] Error auto-confirming orders:", err);
    }
  });
});

export default app;
