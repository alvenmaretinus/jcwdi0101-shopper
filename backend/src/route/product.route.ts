import productRouter from "../controller/product.controller";
import { Router } from "express";

const router = Router().use("/product", productRouter);

export default router;