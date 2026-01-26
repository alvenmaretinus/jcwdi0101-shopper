import { Router } from "express";
import { PrismaRepository as ProductMovementRepoImpl } from "../repository/productmovement/adapter_prisma";
import { ProductMovementService, ProductMovementService as ProductMovementServiceImpl } from "../service/productmovement/productmovement.service";
import { prisma } from "../lib/db/prisma";
import { ProductMovementRepo } from "../repository/productmovement/interface";
import { isSuperAdmin } from "../middleware/isSuperAdmin";
import { CreateProductMovementSchema, GetProductMovementsByFilterSchema } from "../schema/productmovement";
import { isAuth } from "../middleware/isAuth";


const productMovementRepo: ProductMovementRepo = new ProductMovementRepoImpl(prisma);
const productMovementService: ProductMovementService = new ProductMovementServiceImpl(productMovementRepo);

const router = Router()

router.post("/productmovement", isAuth, isSuperAdmin, async (req, res) => {
  const inputData = CreateProductMovementSchema.parse(req.body);
  const result = await productMovementService.createProductMovement(inputData);
  return res.status(201).json(result);
});

router.get("/productmovements", async (req, res) => {
  const inputData = GetProductMovementsByFilterSchema.parse(req.query);
  const result = await productMovementService.getProductMovementsByFilter(inputData);
  return res.json(result);
});

export default router;