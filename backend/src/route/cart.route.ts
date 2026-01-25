import cartRouter from "../controller/cart.controller";
import { Router } from "express";

const router = Router().use("/cart", cartRouter);
export default router;
