import "dotenv/config";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";
import { appRouter } from "./route";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import cron from "node-cron";
import { OrderService } from "./service/order.service";

// ✅ CRITICAL: Validate all required environment variables at startup
const requiredEnvVars = ["MIDTRANS_SERVER_KEY", "MIDTRANS_CLIENT_KEY", "BANK_ACCOUNT_NUMBER", "BANK_ACCOUNT_HOLDER"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ FATAL: Missing required environment variable: ${envVar}`);
    console.error("Please configure all required env vars in .env file");
    process.exit(1);
  }
}

console.log("✅ All required environment variables loaded");

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

app.all("/api/auth/*splat", toNodeHandler(auth));

// Parse JSON bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

app.use("/api", appRouter);
// Global error handler
app.use(errorHandler);

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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app;
