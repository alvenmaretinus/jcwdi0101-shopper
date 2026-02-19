import express from "express";
import { Request, Response, NextFunction } from "express";
import { isAuth } from "../middleware/isAuth";
import { isAdmin } from "../middleware/isAdmin";
import { uploadPaymentProof } from "../middleware/uploadPaymentProof";
import { OrderService } from "../service/order.service";

const router = express.Router();

const asyncHandler = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<Response | void>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const getMulterErrorMessage = (err: unknown): string => {
  const message = (err as { message?: string })?.message;
  return message || "File upload failed - invalid file or size exceeded";
};

const isMulterSizeError = (err: unknown): boolean => {
  const code = (err as { code?: string; name?: string })?.code || (err as { name?: string })?.name;
  return code === "LIMIT_FILE_SIZE" || code === "MulterError";
};

const removeUploadedFile = async (path: string): Promise<void> => {
  const fs = await import("fs");
  await fs.promises.unlink(path).catch(() => {});
};

const validateUploadedImage = async (path: string): Promise<void> => {
  const sharp = await import("sharp");
  const metadata = await sharp.default(path).metadata();
  if (metadata.format && ["jpeg", "png"].includes(metadata.format)) return;
  throw new Error("Uploaded file is not a valid image. File may be corrupted, tampered, or renamed. Please upload a genuine JPG or PNG payment proof.");
};

const getAdminStoreId = async (adminId: string, userRole?: string): Promise<string | undefined> => {
  if (userRole !== "ADMIN") return undefined;
  const { prisma } = await import("../lib/db/prisma");
  const user = await prisma.user.findUnique({ where: { id: adminId } });
  return user?.storeId ?? undefined;
};

// Error handler wrapper for multer file upload
const handleMulterUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadPaymentProof.single("proof")(req, res, (err) => {
    if (!err) return next();
    console.error("[PaymentProof] Multer upload error:", err);
    if (isMulterSizeError(err)) {
      return res.status(413).json({ success: false, message: "File too large. Maximum allowed size is 1MB." });
    }
    return res.status(400).json({ success: false, message: getMulterErrorMessage(err) });
  });
};

const getBankInfoHandler = async (_req: Request, res: Response): Promise<Response> => {
  const bankInfo = await OrderService.getBankInfo();
  return res.status(200).json({ success: true, data: bankInfo });
};

const uploadProofHandler = async (req: Request, res: Response): Promise<Response> => {
  const orderId = req.params.id as string;
  const userId = req.user?.id as string;
  if (!req.file) return res.status(400).json({ success: false, message: "Payment proof file is required" });
  try {
    await validateUploadedImage(req.file.path);
    const proofPath = `/uploads/payment-proof/${req.file.filename}`;
    const order = await OrderService.uploadPaymentProof(orderId, userId, proofPath);
    return res.status(200).json({ success: true, data: order, message: "Payment proof uploaded successfully (waiting for admin confirmation)" });
  } catch (err) {
    await removeUploadedFile(req.file.path);
    if (err instanceof Error) return res.status(400).json({ success: false, message: err.message });
    throw err;
  }
};

const rejectProofHandler = async (req: Request, res: Response): Promise<Response> => {
  const orderId = req.params.id as string;
  const { reason } = req.body;
  const adminId = req.user?.id as string;
  const adminStoreId = await getAdminStoreId(adminId, req.user?.role);
  const order = await OrderService.rejectPaymentProof(orderId, reason, adminId, adminStoreId);
  return res.status(200).json({ success: true, data: order, message: "Payment proof rejected. User may re-upload." });
};

/**
 * @route GET /bank-info
 * @desc Get bank account details for bank transfer payment
 * @access Private (User)
 */
router.get("/bank-info", isAuth, asyncHandler(getBankInfoHandler));

/**
 * @route POST /:id/upload-proof
 * @desc Upload payment proof with image validation
 * @access Private (User)
 * @security Sharp validation to ensure file is actual image (not renamed malware)
 */
router.post("/:id/upload-proof", isAuth, handleMulterUpload, asyncHandler(uploadProofHandler));

/**
 * @route POST /:id/reject-proof
 * @desc Reject payment proof and allow user to re-upload
 * @access Private (Admin)
 */
router.post("/:id/reject-proof", isAuth, isAdmin, asyncHandler(rejectProofHandler));

export default router;
