import express from "express";
import { Request, Response, NextFunction } from "express";
import { isAuth } from "../middleware/isAuth";
import { OrderService } from "../service/order.service";
import { isAdmin } from "../middleware/isAdmin";
import { NotFoundError } from "../error/NotFoundError";
import { UnauthorizedError } from "../error/UnauthorizedError";

const router = express.Router();

// ⚠️ Route order: specific routes BEFORE dynamic /:id routes

/**
 * @route GET /
 * @desc Get all orders with pagination, filtering, sorting
 * @access Private (User/Admin)
 */
router.get("/", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const userRole = req.user?.role as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string | undefined;

    // Validate sortBy and sortOrder against allowlist
    const validSortBy = ["createdAt", "status"];
    const validSortOrder = ["asc", "desc"];
    const sortBy = (validSortBy.includes(req.query.sortBy as string) ? req.query.sortBy : "createdAt") as "createdAt" | "status";
    const sortOrder = (validSortOrder.includes(req.query.sortOrder as string) ? req.query.sortOrder : "desc") as "asc" | "desc";
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;
    const search = req.query.search as string | undefined;

    let storeId: string | undefined;
    if (userRole === "ADMIN") {
      const { prisma } = await import("../lib/db/prisma");
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (user?.storeId) {
        storeId = user.storeId;
      }
    }

    const result = await OrderService.getOrders(userId, userRole, storeId, page, limit, status, sortBy, sortOrder, dateFrom, dateTo, search);
    return res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (err: any) {
    next(err);
  }
});

/**
 * @route POST /checkout/shipping-info
 * @desc Get nearest store + shipping methods for an address (Early Store Selection)
 * @access Private (User)
 */
router.post("/checkout/shipping-info", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const { addressId } = req.body;

    if (!userId || !addressId) {
      return res.status(400).json({ success: false, message: "SHIPPING_ADDRESS_REQUIRED" });
    }

    const result = await OrderService.getCheckoutShippingInfo(userId, addressId);
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    next(err);
  }
});

/**
 * @route POST /checkout/pricing-breakdown
 * @desc Get per-item discount breakdown for checkout display
 * @access Private (User)
 */
router.post("/checkout/pricing-breakdown", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const { addressId, voucherIds, discountIds, shippingCost } = req.body;

    if (!userId || !addressId) {
      return res.status(400).json({ success: false, message: "SHIPPING_ADDRESS_REQUIRED" });
    }

    const result = await OrderService.getCheckoutPricingBreakdown(
      userId,
      addressId,
      voucherIds,
      discountIds,
      shippingCost,
    );
    return res.status(200).json({ success: true, data: result });
  } catch (err: any) {
    next(err);
  }
});

/**
 * @route POST /checkout
 * @desc Create a pending order
 * @access Private (User)
 */
router.post("/checkout", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id as string;
    const { addressId, paymentType, voucherIds, shippingCost, shippingMethod } = req.body;

    if (!userId || !addressId) {
      return res.status(400).json({ success: false, message: "SHIPPING_ADDRESS_REQUIRED" });
    }

    const order = await OrderService.createPendingOrder(userId, addressId, paymentType, voucherIds, undefined, shippingCost, shippingMethod);
    return res.status(200).json({ success: true, data: order, message: "Order created (PAYMENT_PENDING)" });
  } catch (err: any) {
    next(err);
  }
});

/**
 * @route POST /admin/expire-pending
 * @desc Manually expire PAYMENT_PENDING orders past deadline
 * @access Private (Admin)
 */
router.post("/admin/expire-pending", isAuth, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role as string;

    // Only SUPERADMIN can expire orders globally
    if (userRole !== "SUPERADMIN") {
      throw new UnauthorizedError("Only SUPERADMIN can expire pending orders");
    }

    const result = await OrderService.expirePendingOrders();
    return res.status(200).json({ success: true, data: result, message: `Expired ${result.count} orders` });
  } catch (err: any) {
    next(err);
  }
});

/**
 * @route POST /admin/auto-deliver
 * @desc Manually trigger auto-delivery job for shipped orders past threshold
 * @access Private (Superadmin)
 */
router.post("/admin/auto-deliver", isAuth, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role as string;

    if (userRole !== "SUPERADMIN") {
      throw new UnauthorizedError("Only SUPERADMIN can trigger auto-deliver");
    }

    const result = await OrderService.autoDeliverOrders();
    return res.status(200).json({
      success: true,
      data: result,
      message: `Auto-delivered ${result.count} orders`,
    });
  } catch (err: any) {
    next(err);
  }
});

/**
 * @route POST /admin/auto-complete
 * @desc Manually trigger auto-completion job for delivered orders past threshold
 * @access Private (Superadmin)
 */
router.post("/admin/auto-complete", isAuth, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userRole = req.user?.role as string;

    if (userRole !== "SUPERADMIN") {
      throw new UnauthorizedError("Only SUPERADMIN can trigger auto-complete");
    }

    const result = await OrderService.autoCompleteOrders();
    return res.status(200).json({
      success: true,
      data: result,
      message: `Auto-completed ${result.count} orders`,
    });
  } catch (err: any) {
    next(err);
  }
});

/**
 * @route POST /webhook/midtrans
 * @desc Handle Midtrans payment gateway webhooks
 * @access Public (Midtrans server + signature verification)
 */
router.post("/webhook/midtrans", async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const webhookData = req.body;
    const { MidtransService } = await import("../service/midtrans.service");

    console.info("[Webhook] Midtrans webhook received:", {
      orderId: webhookData.order_id,
      transactionId: webhookData.transaction_id,
      status: webhookData.transaction_status,
    });

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error("[Webhook] MIDTRANS_SERVER_KEY not configured");
      return res.status(500).json({ success: false, message: "Server configuration error - MIDTRANS_SERVER_KEY missing" });
    }

    const orderId = webhookData.order_id || "";
    const statusCode = webhookData.status_code || "";
    const grossAmount = webhookData.gross_amount || "";
    const signature = webhookData.signature_key || "";

    if (!signature) {
      console.error("[Webhook] Missing signature_key");
      return res.status(401).json({ success: false, message: "Missing signature_key in webhook payload" });
    }

    // Verify webhook signature (security: prevent unauthorized calls)
    const isValidSignature = MidtransService.verifyWebhookSignature(orderId, statusCode, grossAmount, signature);
    if (!isValidSignature) {
      console.error("[Webhook] Invalid signature - potential security threat", { orderId: webhookData.order_id, clientIP: req.ip });
      return res.status(401).json({ success: false, message: "Invalid webhook signature" });
    }
    await OrderService.handleMidtransWebhook(webhookData);

    return res.status(200).json({ success: true, message: "Webhook processed" });
  } catch (err: any) {
    console.error("[Webhook] Error processing Midtrans webhook:", err);
    return res.status(500).json({
      success: false,
      message: "Webhook received but processing failed - check server logs for details",
    });
  }
});

/**
 * @route GET /:id
 * @desc Get order details by ID
 * @access Private (User owns order or Admin)
 */
router.get("/:id", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const userId = req.user?.id as string;
    const userRole = req.user?.role as string;

    let targetUserId: string | undefined;
    let targetStoreId: string | undefined;

    if (userRole === "USER") {
      targetUserId = userId;
    } else if (userRole === "ADMIN") {
      const { prisma } = await import("../lib/db/prisma");
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (user?.storeId) {
        targetStoreId = user.storeId;
      }
    }

    const order = await OrderService.getOrderById(orderId, targetUserId, targetStoreId);
    return res.status(200).json({ success: true, data: order });
  } catch (err: any) {
    next(err);
  }
});

/**
 * @route POST /:id/cancel
 * @desc Cancel PAYMENT_PENDING order
 * @access Private (User)
 */
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

/**
 * @route POST /:id/admin-cancel
 * @desc Cancel order with automatic stock refund
 * @access Private (Admin)
 */
router.post("/:id/admin-cancel", isAuth, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const { reason } = req.body;
    const userRole = req.user?.role as string;
    const userId = req.user?.id as string;

    // If ADMIN, verify they own the store for this order
    if (userRole === "ADMIN") {
      const { prisma } = await import("../lib/db/prisma");
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundError("Order not found");

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.storeId !== order.storeId) {
        throw new UnauthorizedError("You can only cancel orders from your own store");
      }
    }

    const order = await OrderService.adminCancelOrder(orderId, reason);
    return res.status(200).json({ success: true, data: order, message: "Order cancelled by admin, stock refunded if applicable" });
  } catch (err: any) {
    next(err);
  }
});

/**
 * @route POST /:id/ship
 * @desc Mark order as shipped
 * @access Private (Admin)
 */
router.post("/:id/ship", isAuth, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const userRole = req.user?.role as string;
    const userId = req.user?.id as string;

    // If ADMIN, verify they own the store for this order
    if (userRole === "ADMIN") {
      const { prisma } = await import("../lib/db/prisma");
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundError("Order not found");

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.storeId !== order.storeId) {
        throw new UnauthorizedError("You can only ship orders from your own store");
      }
    }

    const order = await OrderService.shipOrder(orderId);
    return res.status(200).json({ success: true, data: order, message: "Order marked as shipped" });
  } catch (err: any) {
    next(err);
  }
});

/**
 * @route POST /:id/confirm
 * @desc Confirm order completion
 * @access Private (User)
 */
router.post("/:id/confirm", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const userId = req.user?.id as string;

    const order = await OrderService.confirmOrder(orderId, userId);
    return res.status(200).json({ success: true, data: order, message: "Order confirmed as completed" });
  } catch (err: any) {
    next(err);
  }
});

/**
 * @route POST /:id/approve
 * @desc Confirm payment and process order
 * @access Private (Admin)
 */
router.post("/:id/approve", isAuth, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const userRole = req.user?.role as string;
    const userId = req.user?.id as string;

    // If ADMIN, verify they own the store for this order
    if (userRole === "ADMIN") {
      const { prisma } = await import("../lib/db/prisma");
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) throw new NotFoundError("Order not found");

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.storeId !== order.storeId) {
        throw new UnauthorizedError("You can only approve orders from your own store");
      }
    }

    const order = await OrderService.confirmPayment(orderId);
    return res.status(200).json({ success: true, data: order });
  } catch (err: any) {
    next(err);
  }
});

/**
 * @route POST /:id/create-charge
 * @desc Create Midtrans payment charge for PAYMENT_GATEWAY orders
 * @access Private (User)
 */
router.post("/:id/create-charge", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const userId = req.user?.id as string;

    // Security: verify order belongs to user
    const order = await (
      await import("../lib/db/prisma")
    ).prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      return res.status(400).json({ success: false, message: "Order not found or unauthorized" });
    }

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

export default router;
