import { Router } from "express";
import { PrismaRepository as ProductMovementRepoImpl } from "../repository/productmovement/adapter_prisma";
import { ProductMovementService } from "../service/productmovement/productmovement.service";
import { prisma } from "../lib/db/prisma";
import { ProductMovementRepo } from "../repository/productmovement/interface";
import { isSuperAdmin } from "../middleware/isSuperAdmin";
import { CreateProductMovementInput, CreateProductMovementSchema, GetProductMovementsByFilterInput, GetProductMovementsByFilterSchema } from "../schema/productmovement";
import { isAuth } from "../middleware/isAuth";
import { isAdmin } from "../middleware/isAdmin";
import { Service } from "../service/productmovement/interface";


const productMovementRepo: ProductMovementRepo = new ProductMovementRepoImpl(prisma);
const productMovementService: Service = new ProductMovementService(productMovementRepo);

const router = Router();

router.post("/", isAuth, isSuperAdmin, async (req, res) => {
  const inputData: CreateProductMovementInput = CreateProductMovementSchema.parse(req.body);
  const result = await productMovementService.createProductMovement(inputData);
  return res.status(201).json(result);
});

router.get("/", isAuth, isAdmin, async (req, res) => {
  const inputData: GetProductMovementsByFilterInput = GetProductMovementsByFilterSchema.parse(req.query);
  const result = await productMovementService.getProductMovementsByFilter(inputData);
  return res.json(result);
});

export default router;