import orderRouter from "../controller/order.controller";
import paymentProofRouter from "../controller/payment-proof.controller";
import { Router } from "express";

const router = Router().use("/order/payment-proof", paymentProofRouter).use("/order", orderRouter);

export default router;
