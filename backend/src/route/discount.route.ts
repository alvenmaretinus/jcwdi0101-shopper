import discountRouter from "../controller/discount.controller";
import { Router } from "express";

const router = Router().use("/discounts", discountRouter);
export default router;

