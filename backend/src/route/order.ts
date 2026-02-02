import orderRouter from "../controller/order.controller";
import { Router } from "express";

const router = Router().use("/order", orderRouter);
export default router;
