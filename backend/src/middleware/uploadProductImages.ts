import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads", "product-images");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Use UUID v4 for guaranteed unique filenames across concurrent uploads
    const ext = path.extname(file.originalname);
    const uniqueId = uuidv4();
    cb(null, `product-${uniqueId}${ext}`);
  },
});

// File filter - only check extension and mimetype upfront (synchronous)
// Full validation with sharp will be done in POST handler after file is written
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
  const allowedExts = [".jpg", ".jpeg", ".png", ".gif"];

  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;

  // Check extension and mimetype (fast, synchronous check)
  if (!allowedMimes.includes(mime) || !allowedExts.includes(ext)) {
    cb(new Error("Invalid file type. Only .jpg, .jpeg, .png, .gif files are allowed."));
    return;
  }

  // Allow to proceed - full image validation happens after upload
  cb(null, true);
};

// Create and export multer middleware
const uploadProductImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB max per file
  },
});

export { uploadProductImages };
