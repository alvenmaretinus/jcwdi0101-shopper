import express from "express";
import { Request, Response, NextFunction } from "express";
import { isAuth } from "../middleware/isAuth";
import { isAdmin } from "../middleware/isAdmin";
import { uploadPaymentProof } from "../middleware/uploadPaymentProof";
import { OrderService } from "../service/order.service";

const router = express.Router();

// Error handler wrapper for multer file upload
const handleMulterUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadPaymentProof.single("proof")(req, res, (err) => {
    if (err) {
      console.error("[PaymentProof] Multer upload error:", err);
      // Multer exposes a code property for limit errors
      const code = (err as any).code || (err as Error).name;
      if (code === "LIMIT_FILE_SIZE" || code === "MulterError") {
        return res.status(413).json({
          success: false,
          message: "File too large. Maximum allowed size is 1MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message: (err as any).message || "File upload failed - invalid file or size exceeded",
      });
    }
    next();
  });
};

/**
 * @route GET /bank-info
 * @desc Get bank account details for bank transfer payment
 * @access Private (User)
 */
router.get("/bank-info", isAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bankInfo = await OrderService.getBankInfo();
    return res.status(200).json({ success: true, data: bankInfo });
  } catch (err: any) {
    next(err);
  }
});

/**
 * @route POST /:id/upload-proof
 * @desc Upload payment proof with image validation
 * @access Private (User)
 * @security Sharp validation to ensure file is actual image (not renamed malware)
 */
router.post("/:id/upload-proof", isAuth, handleMulterUpload, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const userId = req.user?.id as string;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "Payment proof file is required" });
    }

    // Post-upload validation: verify file is actual valid image using sharp
    const sharp = await import("sharp");
    try {
      const metadata = await sharp.default(req.file.path).metadata();

      // Ensure it's valid image format (not renamed malware)
      if (!metadata.format || !["jpeg", "png"].includes(metadata.format)) {
        const fs = await import("fs");
        fs.promises.unlink(req.file.path).catch(() => {});

        return res.status(400).json({
          success: false,
          message: "Uploaded file is not a valid image. File may be corrupted, tampered, or renamed. Please upload a genuine JPG or PNG payment proof.",
        });
      }
    } catch (validationErr) {
      const fs = await import("fs");
      fs.promises.unlink(req.file.path).catch(() => {});

      return res.status(400).json({
        success: false,
        message: `File validation failed: ${validationErr instanceof Error ? validationErr.message : "Invalid image"}. Please upload a valid JPG or PNG file.`,
      });
    }

    // Store file path for order record
    const proofPath = `/uploads/payment-proof/${req.file.filename}`;

    const order = await OrderService.uploadPaymentProof(orderId, userId, proofPath);
    return res.status(200).json({
      success: true,
      data: order,
      message: "Payment proof uploaded successfully (waiting for admin confirmation)",
    });
  } catch (err: any) {
    // Clean up uploaded file if service operation fails
    try {
      if (req.file && req.file.path) {
        const fs = await import("fs");
        fs.promises.unlink(req.file.path).catch(() => {});
      }
    } catch {
      // Swallow cleanup errors to avoid masking the original error
    }
    next(err);
  }
});

/**
 * @route POST /:id/reject-proof
 * @desc Reject payment proof and allow user to re-upload
 * @access Private (Admin)
 */
router.post("/:id/reject-proof", isAuth, isAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id as string;
    const { reason } = req.body;
    const adminId = req.user?.id as string;

    // Get storeId from user if ADMIN
    let adminStoreId: string | undefined;
    const userRole = req.user?.role;
    if (userRole === "ADMIN") {
      const { prisma } = await import("../lib/db/prisma");
      const user = await prisma.user.findUnique({ where: { id: adminId } });
      adminStoreId = user?.storeId ?? undefined;
    }

    const order = await OrderService.rejectPaymentProof(orderId, reason, adminId, adminStoreId);
    return res.status(200).json({
      success: true,
      data: order,
      message: "Payment proof rejected. User may re-upload.",
    });
  } catch (err: any) {
    next(err);
  }
});

export default router;
