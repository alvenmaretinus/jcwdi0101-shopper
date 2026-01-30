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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

export default app;
