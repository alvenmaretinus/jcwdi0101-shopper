import express from "express";
import { Request, Response, NextFunction } from "express";
import { isAuth } from "../middleware/isAuth";
import { OrderService } from "../service/order.service";

const router = express.Router();

router.post("/checkout", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const { latitude, longitude, addressText, paymentType } = req.body;
    if (!userId || latitude == null || longitude == null || !addressText) {
      return res.status(400).json({ success: false, message: "Missing parameters" });
    }

    const order = await OrderService.checkout(userId, { latitude, longitude, addressText }, paymentType);
    return res.status(200).json({ success: true, data: order, message: "Order created" });
  } catch (err: any) {
    next(err);
  }
});

export default router;
