import { Request, Response, NextFunction } from "express";
import { CartService } from "../service/cart.service";
import { isAuth } from "../middleware/isAuth";
import express from "express";
import { AddToCartSchema } from "../schema/cart/AddToCartSchema";
import { validateRequest } from "../middleware/validateRequest";

const router = express.Router();

const parseQueryStringArray = (
  value: string | string[] | undefined,
): string[] | undefined => {
  if (!value) return undefined;

  const source = Array.isArray(value) ? value : value.split(",");
  const normalized = source
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  return normalized.length > 0 ? normalized : undefined;
};

router.post("/", isAuth, validateRequest(AddToCartSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { productId, quantity } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: "Missing parameters" });
    }

    const item = await CartService.addToCart(userId, productId, quantity ?? 1);
    return res.status(200).json({ success: true, data: item, message: "Added to cart" });
  } catch (err: any) {
    next(err);
  }
});

router.get("/", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const recommendedStoreId = req.query.storeId as string | undefined;
    const discountIds = parseQueryStringArray(req.query.discountIds as string | string[] | undefined);
    const voucherIds = parseQueryStringArray(req.query.voucherIds as string | string[] | undefined);

    if (!userId) {
      return res.status(400).json({ success: false, message: "Missing parameters" });
    }

    const cart = await CartService.getCart(
      userId,
      recommendedStoreId,
      discountIds,
      voucherIds,
    );
    return res.status(200).json({ success: true, data: cart, message: "Cart retrieved" });
  } catch (err: any) {
    next(err);
  }
});

router.patch("/", isAuth, validateRequest(AddToCartSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { productId, quantity } = req.body;
    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: "Missing parameters" });
    }
    const updatedItem = await CartService.updateCartItemQuantity(userId, productId, quantity ?? 1);
    return res.status(200).json({ success: true, data: updatedItem, message: "Cart item updated" });
  } catch (err: any) {
    next(err);
  }
});

router.delete("/", isAuth, validateRequest(AddToCartSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ success: false, message: "Missing parameters" });
    }

    await CartService.deleteCartItem(userId, productId);
    return res.status(200).json({ success: true, message: "Cart item deleted" });
  } catch (err: any) {
    next(err);
  }
});

export default router;
