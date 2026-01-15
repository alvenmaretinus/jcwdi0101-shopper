import { Request, Response } from "express";
import { addToCart as svcAddToCart } from "../service/crate.service";

export const addToCart = async (req: Request, res: Response) => {
  try {
    const { userId, storeId, productId, quantity } = req.body;
    if (!userId || !storeId || !productId) {
      return res.status(400).json({ success: false, message: "Missing parameters" });
    }
    const item = await svcAddToCart(userId, storeId, productId, quantity ?? 1);
    return res.status(200).json({ success: true, data: item, message: "Added to cart" });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err?.message || "Internal error" });
  }
};
