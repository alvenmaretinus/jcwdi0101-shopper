import { Router } from "express";
import { ProductCategoryRepo } from "../repository/product-category/interface";
import { ProductCategoryService } from "../service/product-category/product-category.service";
import { prisma } from "../lib/db/prisma";
import { PrismaRepository } from "../repository/product-category/adapter_prisma";
import { Service } from "../service/product-category/interface";
import { CreateProductCategorySchema, DeleteProductCategoryByIdSchema, GetProductCategoriesByFilterSchema, GetProductCategoryByIdSchema, UpdateProductCategorySchema } from "../schema/product-categories";
import { isAuth } from "../middleware/isAuth";
import { isSuperAdmin } from "../middleware/isSuperAdmin";
import { NotFoundError } from "../error/NotFoundError";

const productCategoryRepo: ProductCategoryRepo = new PrismaRepository(prisma);
const productCategoryService: Service = new ProductCategoryService(productCategoryRepo);

const router = Router();

// All get routes are public
router.get("/", async (req, res) => {
  const filter = GetProductCategoriesByFilterSchema.parse(req.query);
  const categories = await productCategoryService.getProductCategoriesByFilter(filter);
  return res.json(categories);
});

router.get("/:id", async (req, res) => {
  const { id } = GetProductCategoryByIdSchema.parse(req.params);
  const category = await productCategoryService.getProductCategoryById(id);
  if (!category) {
    return res.status(404).json({ message: "Product category not found" });
  }
  return res.json(category);
});

router.post("/", isAuth, isSuperAdmin, async (req, res) => {
  const categoryData = CreateProductCategorySchema.parse(req.body);
  const newCategory = await productCategoryService.createProductCategory(categoryData);
  return res.status(201).json(newCategory);
});

router.patch("/:id", isAuth, isSuperAdmin, async (req, res) => {
  const data = UpdateProductCategorySchema.parse({
    ...req.body,
    id: req.params.id,
  });
  const updatedCategory = await productCategoryService.updateProductCategory(data.id, data);
  return res.json(updatedCategory);
});

router.delete("/:id", isAuth, isSuperAdmin, async (req, res) => {
  const { id } = DeleteProductCategoryByIdSchema.parse(req.params);
  try{
    await productCategoryService.deleteProductCategory(id);
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return res.status(404).json({ message: "Product category not found" });
    }
    throw error;
  }
  return res.status(204).send();
}); 

export default router;