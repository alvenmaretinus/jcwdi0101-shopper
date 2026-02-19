import express from "express";
import { Request, Response, NextFunction } from "express";
import { isAuth } from "../middleware/isAuth";
import { OrderService } from "../service/order.service";
import { isAdmin } from "../middleware/isAdmin";
import { NotFoundError } from "../error/NotFoundError";
import { UnauthorizedError } from "../error/UnauthorizedError";

const router = express.Router();

// ⚠️ Route order: specific routes BEFORE dynamic /:id routes

type SortBy = "createdAt" | "status";
type SortOrder = "asc" | "desc";

const asyncHandler = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const getPagination = (req: Request): { page: number; limit: number } => ({
  page: parseInt(req.query.page as string) || 1,
  limit: parseInt(req.query.limit as string) || 10,
});

const getSort = (req: Request): { sortBy: SortBy; sortOrder: SortOrder } => {
  const validSortBy = ["createdAt", "status"];
  const validSortOrder = ["asc", "desc"];
  const sortBy = (validSortBy.includes(req.query.sortBy as string) ? req.query.sortBy : "createdAt") as SortBy;
  const sortOrder = (validSortOrder.includes(req.query.sortOrder as string) ? req.query.sortOrder : "desc") as SortOrder;
  return { sortBy, sortOrder };
};

const getAdminStoreId = async (userId: string): Promise<string | undefined> => {
  const { prisma } = await import("../lib/db/prisma");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.storeId;
};

const resolveOrderAccessScope = async (
  userId: string,
  userRole: string
): Promise<{ targetUserId?: string; targetStoreId?: string }> => {
  if (userRole === "USER") return { targetUserId: userId };
  if (userRole !== "ADMIN") return {};
  const targetStoreId = await getAdminStoreId(userId);
  return { targetStoreId };
};

const ensureAdminOwnsOrder = async (orderId: string, userRole: string, userId: string, action: string): Promise<void> => {
  if (userRole !== "ADMIN") return;
  const { prisma } = await import("../lib/db/prisma");
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new NotFoundError("Order not found");
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.storeId !== order.storeId) throw new UnauthorizedError(`You can only ${action} orders from your own store`);
};

const getWebhookSecurityFields = (webhookData: Record<string, string>) => ({
  orderId: webhookData.order_id || "",
  statusCode: webhookData.status_code || "",
  grossAmount: webhookData.gross_amount || "",
  signature: webhookData.signature_key || "",
});

const getInvalidWebhookResponse = (
  req: Request,
  webhookData: Record<string, string>,
  verifyWebhookSignature: (orderId: string, statusCode: string, grossAmount: string, signature: string) => boolean
): { status: number; message: string } | null => {
  if (!process.env.MIDTRANS_SERVER_KEY) return { status: 500, message: "Server configuration error - MIDTRANS_SERVER_KEY missing" };
  const { orderId, statusCode, grossAmount, signature } = getWebhookSecurityFields(webhookData);
  if (!signature) return { status: 401, message: "Missing signature_key in webhook payload" };
  const isValid = verifyWebhookSignature(orderId, statusCode, grossAmount, signature);
  if (isValid) return null;
  console.error("[Webhook] Invalid signature - potential security threat", { orderId: webhookData.order_id, clientIP: req.ip });
  return { status: 401, message: "Invalid webhook signature" };
};

const ensureOrderBelongsToUser = async (orderId: string, userId: string): Promise<boolean> => {
  const { prisma } = await import("../lib/db/prisma");
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  return Boolean(order && order.userId === userId);
};

const getOrdersHandler = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user?.id as string;
  const userRole = req.user?.role as string;
  const { page, limit } = getPagination(req);
  const { sortBy, sortOrder } = getSort(req);
  const storeId = userRole === "ADMIN" ? await getAdminStoreId(userId) : undefined;
  const status = req.query.status as string | undefined;
  const dateFrom = req.query.dateFrom as string | undefined;
  const dateTo = req.query.dateTo as string | undefined;
  const search = req.query.search as string | undefined;
  const result = await OrderService.getOrders(userId, userRole, storeId, page, limit, status, sortBy, sortOrder, dateFrom, dateTo, search);
  return res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
};

const getShippingInfoHandler = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user?.id as string;
  const { addressId } = req.body;
  if (!userId || !addressId) return res.status(400).json({ success: false, message: "SHIPPING_ADDRESS_REQUIRED" });
  const result = await OrderService.getCheckoutShippingInfo(userId, addressId);
  return res.status(200).json({ success: true, data: result });
};

const checkoutHandler = async (req: Request, res: Response): Promise<Response> => {
  const userId = req.user?.id as string;
  const { addressId, paymentType, voucherIds, shippingCost, shippingMethod } = req.body;
  if (!userId || !addressId) return res.status(400).json({ success: false, message: "SHIPPING_ADDRESS_REQUIRED" });
  const order = await OrderService.createPendingOrder(userId, addressId, paymentType, voucherIds, undefined, shippingCost, shippingMethod);
  return res.status(200).json({ success: true, data: order, message: "Order created (PAYMENT_PENDING)" });
};

const expirePendingOrdersHandler = async (req: Request, res: Response): Promise<Response> => {
  const userRole = req.user?.role as string;
  if (userRole !== "SUPERADMIN") throw new UnauthorizedError("Only SUPERADMIN can expire pending orders");
  const result = await OrderService.expirePendingOrders();
  return res.status(200).json({ success: true, data: result, message: `Expired ${result.count} orders` });
};

const webhookMidtransHandler = async (req: Request, res: Response): Promise<Response> => {
  const webhookData = req.body as Record<string, string>;
  const { MidtransService } = await import("../service/midtrans.service");
  console.info("[Webhook] Midtrans webhook received:", { orderId: webhookData.order_id, transactionId: webhookData.transaction_id, status: webhookData.transaction_status });
  const invalid = getInvalidWebhookResponse(req, webhookData, MidtransService.verifyWebhookSignature);
  if (invalid) return res.status(invalid.status).json({ success: false, message: invalid.message });
  await OrderService.handleMidtransWebhook(webhookData);
  return res.status(200).json({ success: true, message: "Webhook processed" });
};

const getOrderByIdHandler = async (req: Request, res: Response): Promise<Response> => {
  const orderId = req.params.id as string;
  const userId = req.user?.id as string;
  const userRole = req.user?.role as string;
  const { targetUserId, targetStoreId } = await resolveOrderAccessScope(userId, userRole);
  const order = await OrderService.getOrderById(orderId, targetUserId, targetStoreId);
  return res.status(200).json({ success: true, data: order });
};

const cancelOrderHandler = async (req: Request, res: Response): Promise<Response> => {
  const orderId = req.params.id as string;
  const userId = req.user?.id as string;
  const order = await OrderService.cancelOrder(orderId, userId);
  return res.status(200).json({ success: true, data: order, message: "Order cancelled successfully" });
};

const adminCancelOrderHandler = async (req: Request, res: Response): Promise<Response> => {
  const orderId = req.params.id as string;
  const userRole = req.user?.role as string;
  const userId = req.user?.id as string;
  await ensureAdminOwnsOrder(orderId, userRole, userId, "cancel");
  const order = await OrderService.adminCancelOrder(orderId, req.body.reason);
  return res.status(200).json({ success: true, data: order, message: "Order cancelled by admin, stock refunded if applicable" });
};

const shipOrderHandler = async (req: Request, res: Response): Promise<Response> => {
  const orderId = req.params.id as string;
  const userRole = req.user?.role as string;
  const userId = req.user?.id as string;
  await ensureAdminOwnsOrder(orderId, userRole, userId, "ship");
  const order = await OrderService.shipOrder(orderId);
  return res.status(200).json({ success: true, data: order, message: "Order marked as shipped" });
};

const confirmOrderHandler = async (req: Request, res: Response): Promise<Response> => {
  const orderId = req.params.id as string;
  const userId = req.user?.id as string;
  const order = await OrderService.confirmOrder(orderId, userId);
  return res.status(200).json({ success: true, data: order, message: "Order confirmed as delivered" });
};

const approveOrderHandler = async (req: Request, res: Response): Promise<Response> => {
  const orderId = req.params.id as string;
  const userRole = req.user?.role as string;
  const userId = req.user?.id as string;
  await ensureAdminOwnsOrder(orderId, userRole, userId, "approve");
  const order = await OrderService.confirmPayment(orderId);
  return res.status(200).json({ success: true, data: order });
};

const createChargeHandler = async (req: Request, res: Response): Promise<Response> => {
  const orderId = req.params.id as string;
  const userId = req.user?.id as string;
  const canAccess = await ensureOrderBelongsToUser(orderId, userId);
  if (!canAccess) return res.status(400).json({ success: false, message: "Order not found or unauthorized" });
  const transaction = await OrderService.createMidtransCharge(orderId);
  return res.status(200).json({ success: true, data: { orderId, ...transaction }, message: "Payment gateway charge created" });
};

/**
 * @route GET /
 * @desc Get all orders with pagination, filtering, sorting
 * @access Private (User/Admin)
 */
router.get("/", isAuth, asyncHandler(getOrdersHandler));

/**
 * @route POST /checkout/shipping-info
 * @desc Get nearest store + shipping methods for an address (Early Store Selection)
 * @access Private (User)
 */
router.post("/checkout/shipping-info", isAuth, asyncHandler(getShippingInfoHandler));

/**
 * @route POST /checkout
 * @desc Create a pending order
 * @access Private (User)
 */
router.post("/checkout", isAuth, asyncHandler(checkoutHandler));

/**
 * @route POST /admin/expire-pending
 * @desc Manually expire PAYMENT_PENDING orders past deadline
 * @access Private (Admin)
 */
router.post("/admin/expire-pending", isAuth, isAdmin, asyncHandler(expirePendingOrdersHandler));

/**
 * @route POST /webhook/midtrans
 * @desc Handle Midtrans payment gateway webhooks
 * @access Public (Midtrans server + signature verification)
 */
router.post("/webhook/midtrans", asyncHandler(webhookMidtransHandler));

/**
 * @route GET /:id
 * @desc Get order details by ID
 * @access Private (User owns order or Admin)
 */
router.get("/:id", isAuth, asyncHandler(getOrderByIdHandler));

/**
 * @route POST /:id/cancel
 * @desc Cancel PAYMENT_PENDING order
 * @access Private (User)
 */
router.post("/:id/cancel", isAuth, asyncHandler(cancelOrderHandler));

/**
 * @route POST /:id/admin-cancel
 * @desc Cancel order with automatic stock refund
 * @access Private (Admin)
 */
router.post("/:id/admin-cancel", isAuth, isAdmin, asyncHandler(adminCancelOrderHandler));

/**
 * @route POST /:id/ship
 * @desc Mark order as shipped
 * @access Private (Admin)
 */
router.post("/:id/ship", isAuth, isAdmin, asyncHandler(shipOrderHandler));

/**
 * @route POST /:id/confirm
 * @desc Confirm order delivery
 * @access Private (User)
 */
router.post("/:id/confirm", isAuth, asyncHandler(confirmOrderHandler));

/**
 * @route POST /:id/approve
 * @desc Confirm payment and process order
 * @access Private (Admin)
 */
router.post("/:id/approve", isAuth, isAdmin, asyncHandler(approveOrderHandler));

/**
 * @route POST /:id/create-charge
 * @desc Create Midtrans payment charge for PAYMENT_GATEWAY orders
 * @access Private (User)
 */
router.post("/:id/create-charge", isAuth, asyncHandler(createChargeHandler));

export default router;
