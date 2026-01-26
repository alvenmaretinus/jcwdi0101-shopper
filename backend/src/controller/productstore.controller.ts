import { Router } from "express";
import { PrismaRepository as ProductStoreRepoImpl } from "../repository/productstore/adapter_prisma";
import { PrismaRepository as ProductMovementRepoImpl } from "../repository/productmovement/adapter_prisma";
import { ProductStoreService } from "../service/productstore/productstore.service";
import { prisma } from "../lib/db/prisma";
import { ProductStoreRepo } from "../repository/productstore/interface";
import { Service as ProductStoreServiceInterface } from "../service/productstore/interface";
import { ProductMovementRepo } from "../repository/productmovement/interface";
import { isSuperAdmin } from "../middleware/isSuperAdmin";
import { isAuth } from "../middleware/isAuth";
import { GetProductStoreByIdSchema, CreateProductStoreSchema, GetProductStoresByFilterSchema, UpdateProductStoreSchema, DeleteProductStoreByIdSchema } from "../schema/productstore";


const productStoreRepo: ProductStoreRepo = new ProductStoreRepoImpl(prisma);
const productMovementRepo: ProductMovementRepo = new ProductMovementRepoImpl(prisma);

const productStoreService: ProductStoreServiceInterface = new ProductStoreService(productStoreRepo, productMovementRepo);

const router = Router()


router.post("/product-store", isAuth, isSuperAdmin, async (req, res) => {
  const inputData = CreateProductStoreSchema.parse(req.body);
  const result = await productStoreService.createProductStore(inputData);
  return res.status(201).json(result);
});

router.get("/product-store/:id", async (req, res) => {
  const inputData = GetProductStoreByIdSchema.parse(req.params);
  const result = await productStoreService.getProductStoreByID(inputData.id);
  return res.json(result);
});

router.get("/product-stores", async (req, res) => {
  const inputData = GetProductStoresByFilterSchema.parse(req.query);
  const result = await productStoreService.getProductStoresByFilter(inputData);
  return res.json(result);
});

router.patch("/product-store/:id",  isAuth, isSuperAdmin, async (req, res) => {
  const inputData = UpdateProductStoreSchema.parse({id: req.params.id,  ...req.body });
  const result = await productStoreService.updateProductStore(inputData.id!, inputData);
  return res.json(result);
});

router.delete("/product-store/:id",  isAuth, isSuperAdmin, async (req, res) => {
  const { id } = DeleteProductStoreByIdSchema.parse(req.params);
  await productStoreService.deleteProductStore(id);
  return res.status(204).send();
});

export default router;