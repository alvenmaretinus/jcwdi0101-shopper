import { Router } from "express";

//const productStoreRepo = new ProductStoreRepository(prisma);
//const productStoreService = new ProductStoreService(productStoreRepo);

const router = Router()


router.post("/product-store", async (req, res) => {
  //const inputData = CreateProductStoreSchema.parse(req.body);
  //const result = await productStoreService.createProductStore(inputData, req.user);
  return res.status(201).json({ message: "Not implemented" });
});

router.get("/product-store/:id", async (req, res) => {
  //const inputData = GetProductStoreByIdSchema.parse(req.params);
  //const result = await productStoreService.getProductStoreByID(inputData.id);
  return res.json({ message: "Not implemented" });
});

router.get("/product-stores", async (req, res) => {
  //const inputData = GetProductStoresByFilterSchema.parse(req.query);
  //const result = await productStoreService.getProductStoresByFilter(inputData);
  return res.json({ message: "Not implemented" });
});

router.patch("/product-store/:id", async (req, res) => {
  //const { id } = GetProductStoreByIdSchema.parse(req.params);
  //const inputData = UpdateProductStoreSchema.parse(req.body);
  //const result = await productStoreService.updateProductStore(id, inputData, req.user);
  return res.json({ message: "Not implemented" });
});

router.delete("/product-store/:id", async (req, res) => {
  //const { id } = GetProductStoreByIdSchema.parse(req.params);
  //await productStoreService.deleteProductStore(id, req.user);
  return res.status(204).send();
});

export default router;