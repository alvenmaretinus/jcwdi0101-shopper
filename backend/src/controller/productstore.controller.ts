import { Router } from "express";
import { PrismaRepository as ProductStoreRepoImpl } from "../repository/productstore/adapter_prisma";
import { PrismaRepository as ProductMovementRepoImpl } from "../repository/productmovement/adapter_prisma";
import { ProductStoreService } from "../service/productstore/productstore.service";
import { prisma } from "../lib/db/prisma";
import { ProductStoreRepo } from "../repository/productstore/interface";
import { Service as ProductStoreServiceInterface } from "../service/productstore/interface";
import { ProductMovementRepo } from "../repository/productmovement/interface";
import { isAdmin } from "../middleware/isAdmin";
import { isAuth } from "../middleware/isAuth";
import { GetProductStoreByIdSchema, CreateProductStoreSchema, GetProductStoresByFilterSchema, UpdateProductStoreSchema, DeleteProductStoreByIdSchema } from "../schema/productstore";
import { UnauthorizedError } from "../error/UnauthorizedError";
import { UserRole } from "../../prisma/generated/enums";


const productStoreRepo: ProductStoreRepo = new ProductStoreRepoImpl(prisma);
const productMovementRepo: ProductMovementRepo = new ProductMovementRepoImpl(prisma);

const productStoreService: ProductStoreServiceInterface = new ProductStoreService(productStoreRepo, productMovementRepo, prisma);

const router = Router();

router.post("/", isAuth, isAdmin, async (req, res) => {
  const inputData = CreateProductStoreSchema.parse(req.body);
  
  // Check if admin has permission to create stock for this store
  const user = req.user!;
  
  // If user is not SUPERADMIN, check if their storeId matches the requested storeId
  if (user.role !== UserRole.SUPERADMIN) {
    if (!user.storeId || user.storeId !== inputData.storeId) {
      throw new UnauthorizedError("You can only create inventory for your own store");
    }
  }
  
  const result = await productStoreService.createProductStore(inputData);
  return res.status(201).json(result);
});

// Even non-authenticated users can get product store info
router.get("/:id", async (req, res) => {
  const inputData = GetProductStoreByIdSchema.parse(req.params);
  const result = await productStoreService.getProductStoreByID(inputData.id);
  return res.json(result);
});

// We want non-logged in users to be able to see product availability in stores
// Hence no isAuth middleware here
router.get("/", async (req, res) => {
  const inputData = GetProductStoresByFilterSchema.parse(req.query);
  const result = await productStoreService.getProductStoresByFilter(inputData);
  return res.json(result);
});

// UpdateProductStore only allows updates to quantity
router.patch("/:id",  isAuth, isAdmin, async (req, res) => {
  const inputData = UpdateProductStoreSchema.parse({...req.body, id: req.params.id});
  
  // Check if admin has permission to update this store's inventory
  const user = req.user!;
  
  // Fetch the productStore to check its storeId
  const productStore = await productStoreService.getProductStoreByID(inputData.id);
  
  if (!productStore) {
    return res.status(404).json({ error: "Product store not found" });
  }
  
  // Check if attempting reallocation - only SUPERADMIN allowed
  if (inputData.fromStoreId || inputData.toStoreId || inputData.transferQuantity) {
    if (user.role !== UserRole.SUPERADMIN) {
      throw new UnauthorizedError("Only super admins can reallocate stock between stores");
    }
  }
  
  // If user is not SUPERADMIN, check if their storeId matches the productStore's storeId
  if (user.role !== UserRole.SUPERADMIN) {
    if (!user.storeId || user.storeId !== productStore.storeId) {
      throw new UnauthorizedError("You can only update inventory for your own store");
    }
  }
  
  const result = await productStoreService.updateProductStore(inputData);
  return res.json(result);
});

router.delete("/:id",  isAuth, isAdmin, async (req, res) => {
  const { id } = DeleteProductStoreByIdSchema.parse(req.params);
  
  // Check if admin has permission to delete this store's inventory
  const user = req.user!;
  
  // Fetch the productStore to check its storeId
  const productStore = await productStoreService.getProductStoreByID(id);
  
  if (!productStore) {
    return res.status(404).json({ error: "Product store not found" });
  }
  
  // If user is not SUPERADMIN, check if their storeId matches the productStore's storeId
  if (user.role !== UserRole.SUPERADMIN) {
    if (!user.storeId || user.storeId !== productStore.storeId) {
      throw new UnauthorizedError("You can only delete inventory for your own store");
    }
  }
  
  await productStoreService.deleteProductStore(id);
  return res.status(204).send();
});

export default router;