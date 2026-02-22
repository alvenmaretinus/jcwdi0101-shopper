import { Router, Request, Response, NextFunction } from 'express';
import { PrismaRepository } from '../repository/product/adapter_prisma';
import { prisma } from '../lib/db/prisma';
import { ProductService } from '../service/product/product.service';
import { CreateProductInput, CreateProductSchema, GetProductByIdInput, 
    GetProductByIdSchema, DeleteProductByIdSchema, DeleteProductByIdInput,  FilterInput, GetProductsByFilterSchema, 
    GetProductsByFilterInput, UpdateProductSchema } from '../schema/product';
import { isAuth } from '../middleware/isAuth';
import { isSuperAdmin } from '../middleware/isSuperAdmin';
import { uploadProductImages } from '../middleware/uploadProductImages';

const productsRepo = new PrismaRepository(prisma);
const productService = new ProductService(productsRepo, prisma);

const router = Router();

// Non-logged in users can view products
router.get("/",  async (req, res) => {
    const inputData: GetProductsByFilterInput = GetProductsByFilterSchema.parse(req.query);
    const filter: FilterInput = inputData.filter;
    const result = await productService.getProductsByFilterWithOptionalStock(
        filter, 
        inputData.withStock, 
        inputData.withDiscounts,
        inputData.pagination
    );
    return res.json(result);    
});

// Non-logged in users can view products by id
router.get("/:id", async (req, res) => {
    const inputData: GetProductByIdInput = GetProductByIdSchema.parse(req.params);
    const withDiscounts = req.query.withDiscounts === 'true' || req.query.withDiscounts === '1';
    const result = await productService.getProductsByFilterWithOptionalStock(
        { id: inputData.id }, 
        false,
        withDiscounts
    );
    // For single product lookup, return just the data array (without pagination metadata)
    return res.json(result.data);
});

router.post("/", isAuth, isSuperAdmin, async (req, res) => {
    const inputData: CreateProductInput = CreateProductSchema.parse(req.body);
    const createdProduct = await productService.createProduct(inputData);
    return res.status(201).json(createdProduct);
});

router.patch("/:id", isAuth, isSuperAdmin, async (req, res) => {
    const inputData = UpdateProductSchema.parse({ id: req.params.id, ...req.body });
    const updatedProduct = await productService.updateProduct(inputData);
    return res.json(updatedProduct);
});

router.delete("/:id", isAuth, isSuperAdmin, async (req, res) => {
    const inputData: DeleteProductByIdInput = DeleteProductByIdSchema.parse(req.params);
    await productService.deleteProduct(inputData.id);
    return res.status(204).send();
});

// Error handler wrapper for multer file upload
const handleMulterUpload = (req: Request, res: Response, next: NextFunction) => {
  uploadProductImages.array("images", 5)(req, res, (err) => {
    if (err) {
      console.error("[ProductImages] Multer upload error:", err);
      const code = (err as any).code || (err as Error).name;
      if (code === "LIMIT_FILE_SIZE" || code === "MulterError") {
        return res.status(413).json({
          success: false,
          message: "File too large. Maximum allowed size is 1MB per image.",
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
 * @route POST /:id/images
 * @desc Upload product images (multiple files) with validation
 * @access Private (SuperAdmin)
 */
router.post("/:id/images", isAuth, isSuperAdmin, handleMulterUpload, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.id as string;

    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      return res.status(400).json({ success: false, message: "No image files provided" });
    }

    // Post-upload validation: verify files are actual valid images using sharp
    const sharp = await import("sharp");
    const files = Array.isArray(req.files) ? (req.files as Express.Multer.File[]) : [(req.files as any)];
    const fs = await import("fs");

    for (const file of files) {
      try {
        const filePath = (file as Express.Multer.File).path;
        const metadata = await sharp.default(filePath).metadata();

        // Ensure it's valid image format (not renamed malware)
        if (!metadata.format || !["jpeg", "png", "gif"].includes(metadata.format)) {
          await fs.promises.unlink(filePath).catch(() => {});

          return res.status(400).json({
            success: false,
            message: "Uploaded file is not a valid image. File may be corrupted, tampered, or renamed. Please upload genuine JPG, PNG, or GIF images.",
          });
        }
      } catch (validationErr) {
        const filePath = (file as Express.Multer.File).path;
        await fs.promises.unlink(filePath).catch(() => {});

        return res.status(400).json({
          success: false,
          message: `File validation failed: ${validationErr instanceof Error ? validationErr.message : "Invalid image"}. Please upload valid JPG, PNG, or GIF files.`,
        });
      }
    }

    // Store file paths for product images
    const imagePaths: string[] = (files as Express.Multer.File[]).map(f => `/uploads/product-images/${f.filename}`);

    const updatedProduct = await productService.addProductImages(productId, imagePaths);
    return res.status(200).json({
      success: true,
      data: updatedProduct,
      message: "Product images uploaded successfully",
    });
  } catch (err: any) {
    // Clean up uploaded files if service operation fails
    try {
      if (req.files) {
        const files = Array.isArray(req.files) ? (req.files as Express.Multer.File[]) : [(req.files as any)];
        const fs = await import("fs");
        for (const file of files) {
          const filePath = (file as Express.Multer.File).path;
          await fs.promises.unlink(filePath).catch(() => {});
        }
      }
    } catch (cleanupErr) {
      console.error("Error cleaning up uploaded files:", cleanupErr);
    }

    next(err);
  }
});

/**
 * @route DELETE /:productId/images/:imageId
 * @desc Delete a specific product image
 * @access Private (SuperAdmin)
 */
router.delete("/:productId/images/:imageId", isAuth, isSuperAdmin, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productId = req.params.productId as string;
    const imageId = req.params.imageId as string;

    const updatedProduct = await productService.deleteProductImage(productId, imageId);
    return res.status(200).json({
      success: true,
      data: updatedProduct,
      message: "Product image deleted successfully",
    });
  } catch (err: any) {
    next(err);
  }
});


export default router;
