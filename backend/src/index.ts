import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";
import { appRouter } from "./route";
import cors from "cors";

const app = express();
const port = process.env.PORT! || 3001;

// Parse JSON bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

app.use(
  cors({
    origin: "*", // TODO: Only ur frontend origin
    credentials: true,
  })
);

app.use("/api", appRouter);

// Global error handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
