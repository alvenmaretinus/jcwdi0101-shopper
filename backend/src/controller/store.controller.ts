import { Router } from "express";
import { StoreService } from "../service/store.service";
import { GetStoreByIdSchema } from "../schema/store/GetStoreByIdSchema";
import { CreateStoreSchema } from "../schema/store/CreateStoreSchema";
import { UpdateStoreSchema } from "../schema/store/UpdateStoreSchema";

const router = Router();

// TODO: Use isSuperAdmin for some routes

router.get("/", async (req, res) => {
  const result = await StoreService.getStores();
  return res.json(result);
});

router.get("/:id", async (req, res) => {
  const inputData = GetStoreByIdSchema.parse({ ...req.params, ...req.query });
  const result = await StoreService.getStoreById(inputData);
  return res.json(result);
});

router.post("/", async (req, res) => {
  const inputData = CreateStoreSchema.parse(req.body);
  const result = await StoreService.createStore(inputData);
  return res.json(result);
});

router.patch("/:id", async (req, res) => {
  const inputData = UpdateStoreSchema.parse({
    ...req.params,
    ...req.body,
  });
  const result = StoreService.updateStore(inputData);
  return res.json(result);
});

export default router;
