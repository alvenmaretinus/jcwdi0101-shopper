import express from "express";
import { Request, Response, NextFunction } from "express";
import { isAuth } from "../middleware/isAuth";
import { OrderService } from "../service/order.service";
import { isAdmin } from "../middleware/isAdmin";
import { uploadPaymentProof } from "../middleware/uploadPaymentProof";

const router = express.Router();

// Get list of orders with pagination, filter, sort
router.get("/", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const userRole = req.user?.role as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string | undefined;
    const sortBy = (req.query.sortBy as "createdAt" | "status") || "createdAt";
    const sortOrder = (req.query.sortOrder as "asc" | "desc") || "desc";

    // For store admin, they can only see their store's orders
    let storeId: string | undefined;
    if (userRole === "STORE_ADMIN") {
      // Store admin's store is stored in user.storeId
      const { prisma } = await import("../lib/db/prisma");
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (user?.storeId) {
        storeId = user.storeId;
      }
    }

    const result = await OrderService.getOrders(userId, userRole, storeId, page, limit, status, sortBy, sortOrder);
    return res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err: any) {
    next(err);
  }
});

// Get order detail by ID
router.get("/:id", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const userId = req.user?.id as string;
    const userRole = req.user?.role as string;

    // For regular users, enforce ownership check
    let targetUserId: string | undefined;
    if (userRole === "USER") {
      targetUserId = userId;
    }

    const order = await OrderService.getOrderById(orderId, targetUserId);
    return res.status(200).json({ success: true, data: order });
  } catch (err: any) {
    next(err);
  }
});

// Cancel order (user only, before payment)
router.post("/:id/cancel", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const userId = req.user?.id as string;

    const order = await OrderService.cancelOrder(orderId, userId);
    return res.status(200).json({ success: true, data: order, message: "Order cancelled successfully" });
  } catch (err: any) {
    next(err);
  }
});

// Ship order (admin only)
router.post("/:id/ship", isAuth, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;

    const order = await OrderService.shipOrder(orderId);
    return res.status(200).json({ success: true, data: order, message: "Order marked as shipped" });
  } catch (err: any) {
    next(err);
  }
});

// Confirm order receipt (user only)
router.post("/:id/confirm", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const userId = req.user?.id as string;

    const order = await OrderService.confirmOrder(orderId, userId);
    return res.status(200).json({ success: true, data: order, message: "Order confirmed as delivered" });
  } catch (err: any) {
    next(err);
  }
});

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
router.get("/bank-info", isAuth, async (req: Request, res: Response, next: NextFunction) => {
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

// Create Midtrans charge for PAYMENT_GATEWAY orders
router.post("/:id/create-charge", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const userId = req.user?.id as string;

    // Verify order belongs to user
    const order = await (
      await import("../lib/db/prisma")
    ).prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      return res.status(400).json({ success: false, message: "Order not found or unauthorized" });
    }

    // Create Midtrans charge
    const transaction = await OrderService.createMidtransCharge(orderId);

    return res.status(200).json({
      success: true,
      data: {
        orderId,
        transactionId: transaction.transactionId,
        redirectUrl: transaction.redirectUrl,
        token: transaction.token,
        amount: transaction.amount,
      },
      message: "Payment gateway charge created",
    });
  } catch (err: any) {
    next(err);
  }
});

// Midtrans webhook endpoint (verify signature before processing)
router.post("/webhook/midtrans", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const webhookData = req.body;
    const { MidtransService } = await import("../service/midtrans.service");

    console.info("[Webhook] Midtrans webhook received:", {
      orderId: webhookData.order_id,
      transactionId: webhookData.transaction_id,
      status: webhookData.transaction_status,
    });

    // CRITICAL: Verify webhook signature before processing (security check)
    // This prevents attackers from sending fake webhooks to manipulate order status
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error("[Webhook] MIDTRANS_SERVER_KEY not configured - cannot verify webhook");
      return res.status(500).json({ error: "Server configuration error" });
    }

    // Extract signature components from webhook payload
    const orderId = webhookData.order_id || "";
    const statusCode = webhookData.status_code || "";
    const grossAmount = webhookData.gross_amount || "";
    const signature = webhookData.signature_key || "";

    if (!signature) {
      console.error("[Webhook] Missing signature_key in webhook payload");
      return res.status(400).json({ error: "Missing signature" });
    }

    const isValidSignature = MidtransService.verifyWebhookSignature(orderId, statusCode, grossAmount, signature);
    if (!isValidSignature) {
      console.error("[Webhook] Invalid webhook signature - potential security threat", {
        orderId: webhookData.order_id,
        clientIP: req.ip,
      });
      return res.status(401).json({ error: "Invalid signature" });
    }

    // ✅ Signature valid - process webhook
    await OrderService.handleMidtransWebhook(webhookData);

    // ✅ Always return 200 to acknowledge receipt (Midtrans requirement)
    // Even if internal processing had errors, we acknowledge receipt to stop retries
    return res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (err: any) {
    console.error("[Webhook] Error processing Midtrans webhook:", err);
    
    // ⚠️ CRITICAL: Return 200 even on error to prevent Midtrans retry loops
    // The error is logged above for manual investigation
    // If we return 5xx, Midtrans will retry this webhook 10+ times, causing order status inconsistency
    return res.status(200).json({ 
      success: false, 
      message: "Webhook received but processing failed - check server logs for details" 
    });
  }
});

export default router;
