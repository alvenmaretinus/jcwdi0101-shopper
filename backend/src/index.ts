import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const port = process.env.PORT! || 3000;

// Parse JSON bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
