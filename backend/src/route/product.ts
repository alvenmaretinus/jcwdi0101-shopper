import productRouter from "../controller/product.controller";
import { Router } from "express";

const router = Router().use("", productRouter);

export default router;