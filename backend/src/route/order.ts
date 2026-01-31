import orderRouter from "../controller/order.controller";
import paymentProofRouter from "../controller/payment-proof.controller";
import { Router } from "express";

const router = Router().use("/order", orderRouter).use("/order/payment-proof", paymentProofRouter);

export default router;
