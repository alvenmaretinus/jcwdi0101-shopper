import { Request, Response, NextFunction} from "express";
import {  CartService } from "../service/cart.service";
import { isAuth } from "../middleware/isAuth";
import express from "express";
import { BadRequestError } from "../error/BadRequestError";

const router = express.Router();

router.post("/",isAuth, async ( req: Request, res: Response, next:NextFunction) => {
  try {
  
    const { userId, storeId, productId, quantity } = req.body;
    if (!userId || !storeId || !productId) {
      throw new BadRequestError ("Missing parameters");
    }
    const item = await CartService.addToCart(userId, storeId, productId, quantity ?? 1);
    return res.status(200).json({ success: true, data: item, message: "Added to cart" });
  } catch (err) {
  next(err);
  }
});1

export default router;