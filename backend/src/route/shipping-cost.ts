import shippingCostRouter from "../controller/shipping-cost.controller";
import { Router } from "express";

const router = Router().use("/shipping-cost", shippingCostRouter);

export default router;
