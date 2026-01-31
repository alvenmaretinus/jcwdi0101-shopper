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

// File filter - only check extension and mimetype upfront (synchronous)
// Full validation with sharp will be done in POST handler after file is written
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/jpg"];
  const allowedExts = [".jpg", ".jpeg", ".png"];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  // Check extension and mimetype (fast, synchronous check)
  if (!allowedMimes.includes(mime) || !allowedExts.includes(ext)) {
    cb(new Error("Invalid file type. Only .jpg, .jpeg, .png files are allowed."));
    return;
  }

  // Allow to proceed - full image validation happens after upload
  cb(null, true);
};

// Create and export multer middleware
const uploadPaymentProof = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

export { uploadPaymentProof };
