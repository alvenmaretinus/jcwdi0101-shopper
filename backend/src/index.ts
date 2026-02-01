import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";
import { appRouter } from "./route";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app = express();
const port = process.env.PORT! || 3001;
const clientUrl = process.env.CLIENT_URL!;

app.use(
  cors({
    origin: clientUrl || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

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
});

export default app;
