import { Router } from "express";
import path from "path";
import { isAuth } from "../middleware/isAuth";

const router = Router();

// Proxy route to serve payment proof images with authorization checks.
// GET /api/uploads/payment-proof/:filename
router.get("/uploads/payment-proof/:filename", isAuth, async (req, res) => {
  try {
    const rawFilename = req.params.filename;
    if (!rawFilename) return res.status(400).json({ success: false, message: "Filename is required" });
    const filename = Array.isArray(rawFilename) ? rawFilename[0] : rawFilename;
    const user = req.user;

    // Look up order that references this file to perform authorization
    const { prisma } = await import("../lib/db/prisma");
    const proofPath = `/uploads/payment-proof/${filename}`;
    const order = await prisma.order.findFirst({ where: { paymentProofUrl: proofPath } });
    if (!order) return res.status(404).json({ success: false, message: "File not found" });

    // If user is SUPERADMIN allow; if ADMIN allow only for orders belonging to their store
    if (user?.role === "SUPERADMIN") {
      // allowed
    } else if (user?.role === "ADMIN") {
      const admin = await prisma.user.findUnique({ where: { id: user.id } });
      if (!admin || admin.storeId !== order.storeId) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    } else {
      // Regular user can only see their own payment proof
      if (order.userId !== user?.id) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }

    const filePath = path.join(process.cwd(), "uploads", "payment-proof", filename);
    return res.sendFile(filePath, (err) => {
      if (err) {
        console.error("Failed to send file", err);
        if (!res.headersSent) res.status(500).json({ success: false, message: "Failed to serve file" });
      }
    });
  } catch (err) {
    console.error("Error in uploads proxy", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
