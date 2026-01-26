import { Router } from "express";
import { ProductCategoryRepo } from "../repository/product-category/interface";
import { ProductCategoryService } from "../service/product-category/product-category.service";
import { prisma } from "../lib/db/prisma";
import { PrismaRepository } from "../repository/product-category/adapter_prisma";
import { Service } from "../service/product-category/interface";
import { DeleteProductCategoryByIdSchema, GetProductCategoriesByFilterSchema, GetProductCategoryByIdSchema, UpdateProductCategorySchema } from "../schema/product-categories";

const productCategoryRepo: ProductCategoryRepo = new PrismaRepository(prisma);
const productCategoryService: Service = new ProductCategoryService(productCategoryRepo);

const router = Router();

router.get("/product-categories", async (req, res) => {
  const filter = GetProductCategoriesByFilterSchema.parse(req.query);
  const categories = await productCategoryService.getProductCategoriesByFilter(filter);
  return res.json(categories);
});

router.get("/product-category/:id", async (req, res) => {
  const { id } = GetProductCategoryByIdSchema.parse(req.params);
  const category = await productCategoryService.getProductCategoryById(id);
  return res.json(category);
});

router.post("/product-category", async (req, res) => {
  const categoryData = req.body;
  const newCategory = await productCategoryService.createProductCategory(categoryData);
  return res.status(201).json(newCategory);
});

router.patch("/product-category/:id", async (req, res) => {
  const { id } = UpdateProductCategorySchema.parse({
    ...req.params,
    id: req.params.id,
  });
  const updateData = req.body;
  const updatedCategory = await productCategoryService.updateProductCategory(id, updateData);
  return res.json(updatedCategory);
});

router.delete("/product-category/:id", async (req, res) => {
  const { id } = DeleteProductCategoryByIdSchema.parse(req.params);
  await productCategoryService.deleteProductCategory(id);
  return res.status(204).send();
}); 

export default router;