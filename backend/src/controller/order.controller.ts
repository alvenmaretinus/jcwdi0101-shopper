import express from "express";
import { Request, Response, NextFunction } from "express";
import { isAuth } from "../middleware/isAuth";
import { OrderService } from "../service/order.service";
import { isAdmin } from "../middleware/isAdmin";
import { uploadPaymentProof } from "../middleware/uploadPaymentProof";

const router = express.Router();

router.post("/checkout", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const { addressId, paymentType } = req.body;

    if (!userId || !addressId) {
      return res.status(400).json({ success: false, message: "SHIPPING_ADDRESS_REQUIRED" });
    }

    // create pending order and return it; payment should be processed by gateway and webhook will confirm
    const order = await OrderService.createPendingOrder(userId, addressId, paymentType);
    return res.status(200).json({ success: true, data: order, message: "Order created (PAYMENT_PENDING)" });
  } catch (err: any) {
    next(err);
  }
});

// Get bank information for bank transfer payment
router.get("/bank-info", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bankInfo = await OrderService.getBankInfo();
    return res.status(200).json({ success: true, data: bankInfo });
  } catch (err: any) {
    next(err);
  }
});

// Upload payment proof for bank transfer (user uploads payment receipt)
router.post("/:id/upload-proof", isAuth, uploadPaymentProof.single("proof"), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const userId = req.user?.id as string;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Payment proof file is required" });
    }

    // Get the file path relative to project root
    const proofPath = `/uploads/payment-proof/${req.file.filename}`;

    const order = await OrderService.uploadPaymentProof(orderId, userId, proofPath);
    return res.status(200).json({ success: true, data: order, message: "Payment proof uploaded successfully (waiting for admin confirmation)" });
  } catch (err: any) {
    next(err);
  }
});

// Reject payment proof (admin rejects proof and user can re-upload)
router.post("/:id/reject-proof", isAuth, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const { reason } = req.body;

    const order = await OrderService.rejectPaymentProof(orderId, reason);
    return res.status(200).json({ success: true, data: order, message: "Payment proof rejected. User may re-upload." });
  } catch (err: any) {
    next(err);
  }
});

// Webhook endpoint (payment gateway should POST here when payment is completed)
router.post("/webhook", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, status } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: "orderId required" });

    // For simplicity: only process when status indicates success
    if (status === "success" || status === "capture" || status === "settlement") {
      const order = await OrderService.confirmPayment(orderId);
      return res.status(200).json({ success: true, data: order });
    }

    // handle other statuses as needed (cancel, expire, etc.)
    return res.status(200).json({ success: true });
  } catch (err: any) {
    next(err);
  }
});

// Admin approves manual bank-transfer payment (or admin confirms proof)
router.post("/:id/approve", isAuth, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const order = await OrderService.confirmPayment(orderId);
    return res.status(200).json({ success: true, data: order });
  } catch (err: any) {
    next(err);
  }
});

// Admin endpoint to manually expire pending orders (for testing or manual trigger)
router.post("/admin/expire-pending", isAuth, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await OrderService.expirePendingOrders();
    return res.status(200).json({ success: true, data: result, message: `Expired ${result.count} orders` });
  } catch (err: any) {
    next(err);
  }
});

export default router;
