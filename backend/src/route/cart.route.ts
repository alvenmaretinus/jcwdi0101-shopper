import express from "express";
import { addToCart } from "../controller/cart.controller";

const router = express.Router();

router.post("/cart", addToCart);

export default router;
