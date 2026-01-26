import productCategoryRouter from "../controller/product-category.controller";
import { Router } from "express";

const router = Router().use("", productCategoryRouter);

export default router;
