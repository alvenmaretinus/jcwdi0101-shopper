import { Router } from "express";
import { PrismaRepository as ProductMovementRepoImpl } from "../repository/productmovement/adapter_prisma";
import { ProductMovementService, ProductMovementService as ProductMovementServiceImpl } from "../service/productmovement/productmovement.service";
import { prisma } from "../lib/db/prisma";
import { ProductMovementRepo } from "../repository/productmovement/interface";
import { isSuperAdmin } from "../middleware/isSuperAdmin";
import { CreateProductMovementSchema, GetProductMovementsByFilterSchema } from "../schema/productmovement";
import { isAuth } from "../middleware/isAuth";
import { isAdmin } from "../middleware/isAdmin";


const productMovementRepo: ProductMovementRepo = new ProductMovementRepoImpl(prisma);
const productMovementService: ProductMovementService = new ProductMovementServiceImpl(productMovementRepo);

const  router = Router()

router.post("/", isAuth, isSuperAdmin, async (req, res) => {
  const inputData = CreateProductMovementSchema.parse(req.body);
  const result = await productMovementService.createProductMovement(inputData);
  return res.status(201).json(result);
});

router.get("/", isAuth, isAdmin, async (req, res) => {
  const inputData = GetProductMovementsByFilterSchema.parse(req.query);
  const result = await productMovementService.getProductMovementsByFilter(inputData);
  return res.json(result);
});

export default router;