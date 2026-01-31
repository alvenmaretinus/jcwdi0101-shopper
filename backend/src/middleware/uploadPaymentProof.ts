import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads", "payment-proof");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Use timestamp + random to ensure unique filenames
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `proof-${timestamp}-${random}${ext}`);
  },
});

// File filter - validate both extension/mimetype AND actual image content
const fileFilter = async (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];
  const allowedExts = [".jpg", ".jpeg", ".png"];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  // 1. Check extension and mimetype
  if (!allowedMimes.includes(mime) || !allowedExts.includes(ext)) {
    cb(new Error("Invalid file type. Only .jpg, .jpeg, .png files are allowed."));
    return;
  }

  // 2. Validate actual image content using sharp (prevent fake images/malware)
  try {
    const metadata = await sharp(file.stream).metadata();

    // Verify it's actually a valid image
    if (!metadata.format || !["jpeg", "png"].includes(metadata.format)) {
      cb(new Error("Uploaded file is not a valid image. File may be corrupted or tampered."));
      return;
    }

    // ✅ File is valid
    cb(null, true);
  } catch (err) {
    cb(new Error(`File validation failed: ${err instanceof Error ? err.message : "Unknown error"}. Please upload a valid image file.`));
  }
};

// Create multer instance
export const uploadPaymentProof = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024, // 1MB max
  },
});
