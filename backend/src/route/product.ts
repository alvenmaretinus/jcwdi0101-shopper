import productRouter from "../controller/product.controller";
import { Router } from "express";

const router = Router().use("/products", productRouter);

export default router;