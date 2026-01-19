
import addToCartRouter from "../controller/cart.controller";
import { Router } from "express";


const router = Router().use("/cart", addToCartRouter);



export default router;
